import assert from "node:assert/strict";
import { readFile, access, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const packageRoot = new URL("../../packages/aqualy-ui/", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", packageRoot), "utf8"));

test("all 66 public paths target built ESM, declarations or CSS", async () => {
  assert.equal(pkg.type, "module");
  assert.equal(pkg.private, false);
  assert.equal(pkg.license, "MIT");
  assert.equal(pkg.publishConfig.access, "public");
  assert.deepEqual(pkg.sideEffects, ["**/*.css"]);
  assert.deepEqual(pkg.files, ["dist", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "CHANGELOG.md"]);
  assert.equal(Object.keys(pkg.exports).length, 66);
  for (const [subpath, entry] of Object.entries(pkg.exports)) {
    const targets = typeof entry === "string" ? [entry] : Object.values(entry);
    for (const target of targets) {
      assert.ok(target.startsWith("./dist/"), subpath);
      await access(new URL(target, packageRoot));
    }
    if (typeof entry !== "string") {
      assert.match(entry.types, /\.d\.ts$/);
      assert.match(entry.import, /\.js$/);
      assert.ok(Object.keys(await import(new URL(entry.import, packageRoot))).length > 0, subpath);
    }
  }
});

test("client directives survive and emitted imports have no source-only aliases", async () => {
  for (const file of await readdir(new URL("src/components/", packageRoot))) {
    const source = await readFile(new URL(`src/components/${file}`, packageRoot), "utf8");
    const output = await readFile(new URL(`dist/components/${file.replace(".tsx", ".js")}`, packageRoot), "utf8");
    if (source.startsWith('"use client"')) assert.match(output, /^"use client";/, file);
    else assert.doesNotMatch(output, /^"use client";/, file);
  }
  for (const directory of ["components", "lib"]) {
    for (const file of await readdir(new URL(`dist/${directory}/`, packageRoot))) {
      const source = await readFile(new URL(`dist/${directory}/${file}`, packageRoot), "utf8");
      assert.doesNotMatch(source, /["'](?:#|@\/|.*src\/)/, file);
      for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
        assert.match(match[1], /\.js$/);
        const target = new URL(match[1], new URL(`dist/${directory}/${file}`, packageRoot));
        await access(file.endsWith(".d.ts") ? fileURLToPath(target).replace(/\.js$/, ".d.ts") : target);
      }
    }
  }
});

test("compiled CSS requires no consumer Tailwind and every visual selector is scoped", async () => {
  const source = await readFile(new URL("dist/styles.css", packageRoot), "utf8");
  assert.doesNotMatch(source, /@(import|source|theme|apply|custom-variant)\b/);
  assert.match(source, /aqualy-ui-spin/);
  assert.doesNotMatch(source, /--font-sans:\s*var\(--font-sans\)/);
  const css = postcss.parse(source);
  css.walkAtRules("property", rule => assert.ok(rule.params.startsWith("--aqualy-ui-"), rule.params));
  css.walkRules(rule => {
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type === "atrule" && /keyframes$/.test(parent.name)) return;
    }
    selectorParser(selectors => selectors.each(selector => {
      selector.walkPseudos(pseudo => {
        if (pseudo.value === ":is") pseudo.walkPseudos(child => assert.ok(!child.value.startsWith("::"), rule.selector));
      });
      let scoped = false;
      selector.walkAttributes(attribute => { if (["data-aqualy-ui", "data-aqualy-ui-portal"].includes(attribute.attribute)) scoped = true; });
      assert.ok(scoped, rule.selector);
    })).processSync(rule.selector);
  });
});

test("licensed Playground fonts are packaged unchanged and use isolated families", async () => {
  const manifest = JSON.parse(await readFile(new URL("../../config/font-assets.json", import.meta.url), "utf8"));
  const { createHash } = await import("node:crypto");
  const fonts = manifest;
  assert.equal(fonts.length, 4);
  for (const entry of fonts) {
    const data = await readFile(new URL(`dist/fonts/${entry.file}`, packageRoot));
    assert.equal(data.subarray(0, 4).toString(), "wOF2");
    assert.equal(createHash("sha256").update(data).digest("hex"), entry.sha256);
  }
  const license = await readFile(new URL("dist/fonts/FONT-LICENSE.txt", packageRoot), "utf8");
  assert.match(license, /Copyright \(c\) 2023 Vercel/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  const css = postcss.parse(await readFile(new URL("dist/styles.css", packageRoot), "utf8"));
  const faces = [];
  css.walkAtRules("font-face", rule => {
    const declarations = Object.fromEntries(rule.nodes.filter(node => node.type === "decl").map(node => [node.prop, node.value]));
    assert.match(declarations["font-family"], /Aqualy Geist/);
    assert.match(declarations.src, /\.\/fonts\/geist-.*\.woff2/);
    assert.equal(declarations["font-display"], "swap");
    faces.push(declarations);
  });
  assert.equal(faces.length, 4);
});
