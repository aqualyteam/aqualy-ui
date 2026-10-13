import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, readdir, rm, cp } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import selectorParser from "postcss-selector-parser";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageRoot = resolve(root, "packages/aqualy-ui");
const dist = resolve(packageRoot, "dist");
const scope = ":where([data-aqualy-ui], [data-aqualy-ui-portal])";

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : path;
  }))).flat();
}

await rm(dist, { recursive: true, force: true });
execFileSync(process.execPath, [resolve(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.build.json"], { cwd: packageRoot, stdio: "inherit" });

// TypeScript preserves directives and module structure; resolve source-only
// aliases in both JavaScript and declarations so the tarball stands alone.
for (const path of await files(dist)) {
  const source = await readFile(path, "utf8");
  const output = source.replace(/(["'])#(components|lib|hooks)\/([^"']+)\1/g, (_, quote, directory, name) => {
    const target = resolve(dist, directory, `${name}.js`);
    let specifier = relative(dirname(path), target).replaceAll("\\", "/");
    if (!specifier.startsWith(".")) specifier = `./${specifier}`;
    return `${quote}${specifier}${quote}`;
  });
  assert.doesNotMatch(output, /["']#(?:components|lib|hooks)\//, path);
  await writeFile(path, output);
}

const cssPath = resolve(packageRoot, "src/styles/aqualy-ui.css");
let sourceCss = await readFile(cssPath, "utf8");
// No automatic workspace/consumer scanning. Only the explicit package @source
// is used. A scoped preflight makes the package independent of the host reset.
sourceCss = sourceCss.replace('@import "tailwindcss/utilities.css" layer(utilities);', '@import "tailwindcss/preflight.css" layer(base);\n@import "tailwindcss/utilities.css" layer(utilities) source(none);');
const compiled = await postcss([tailwind({ base: packageRoot, optimize: { minify: false } })]).process(sourceCss, { from: cssPath, map: false });
const css = postcss.parse(compiled.css);

css.walkRules(rule => {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === "rule" || (parent.type === "atrule" && /keyframes$/.test(parent.name))) return;
  }
  const selectors = selectorParser().astSync(rule.selector).nodes;
  rule.selector = [...new Set(selectors.flatMap(node => {
    const selector = node.toString().trim();
    if (selector === ":root" || selector === ":host" || selector === "html" || selector === "body") return scope;
    if (selector.includes("[data-aqualy-ui")) return selector;
    // Include scope roots that also carry a utility, as well as descendants.
    // Pseudo-elements are not permitted inside :is(); append them afterwards.
    let pseudoElements = "";
    const subject = node.clone();
    while (subject.last?.type === "pseudo" && (subject.last.value.startsWith("::") || [":before", ":after", ":first-line", ":first-letter"].includes(subject.last.value))) {
      pseudoElements = subject.last.toString() + pseudoElements;
      subject.last.remove();
    }
    const rootSelector = subject.toString().trim();
    return [`${scope} ${selector}`, `${scope}${rootSelector ? `:is(${rootSelector})` : ""}${pseudoElements}`];
  }))].join(",\n");
});

// A self-referential theme declaration shadows an inherited host font after
// scoping. Remove the cycle and let absent host tokens inherit the body font.
css.walkDecls(declaration => {
  if (declaration.prop === "--font-sans" && declaration.value === "var(--font-sans)") declaration.remove();
  if (declaration.prop === "font-family" && declaration.value === "var(--font-sans)") declaration.value = "var(--font-sans, inherit)";
  for (const token of ["feature", "variation"]) {
    if (declaration.prop === `font-${token}-settings` && declaration.value === `var(--default-font-${token}-settings, normal)`) {
      declaration.value = `var(--default-font-${token}-settings, inherit)`;
    }
  }
});

// Keyframe identifiers have a global namespace even when selectors are scoped.
const keyframes = new Map();
css.walkAtRules(/keyframes$/, rule => {
  keyframes.set(rule.params, `aqualy-ui-${rule.params}`);
  rule.params = `aqualy-ui-${rule.params}`;
});
css.walkDecls(declaration => {
  for (const [name, replacement] of keyframes) {
    declaration.value = declaration.value.replace(new RegExp(`(?<![\\w-])${name}(?![\\w-])`, "g"), replacement);
  }
});
// Registered custom properties are also global. Namespace every registration
// and its references to avoid replacing the host's Tailwind initial values.
const registeredProperties = new Set();
css.walkAtRules("property", rule => registeredProperties.add(rule.params));
let outputCss = css.toString();
for (const name of [...registeredProperties].sort((a, b) => b.length - a.length)) {
  outputCss = outputCss.replaceAll(new RegExp(`${name}(?![\\w-])`, "g"), `--aqualy-ui-${name.slice(2)}`);
}
assert.doesNotMatch(outputCss, /@(import|source|theme|apply|custom-variant)\b/);
await writeFile(resolve(dist, "styles.css"), outputCss);
await cp(resolve(packageRoot, "src/assets/fonts"), resolve(dist, "fonts"), { recursive: true });
const emitted = await files(dist);
console.log(`Built ${emitted.filter(path => path.endsWith(".js")).length} ESM modules, declarations, scoped CSS and licensed Geist fonts (${Buffer.byteLength(outputCss)} CSS bytes).`);
