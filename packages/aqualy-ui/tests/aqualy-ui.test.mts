import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"
import assert from "node:assert/strict"

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const packageRoot = join(repositoryRoot, "packages/aqualy-ui")

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>
}

function packageFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? packageFiles(path) : [path]
  })
}

test("canonical package and workspace contracts exist", () => {
  const packageJson = readJson(join(packageRoot, "package.json"))
  const workspace = readFileSync(join(repositoryRoot, "pnpm-workspace.yaml"), "utf8")
  const componentsJson = readJson(join(packageRoot, "components.json"))
  const rootPackage = readJson(join(repositoryRoot, "package.json"))
  const componentsSource = readFileSync(join(packageRoot, "components.json"), "utf8")
  const tsconfigSource = readFileSync(join(packageRoot, "tsconfig.json"), "utf8")

  assert.equal(packageJson.name, "@aqualy/ui")
  assert.equal(packageJson.private, false)
  assert.equal(packageJson.license, "MIT")
  assert.equal((packageJson.publishConfig as Record<string, unknown>).access, "public")
  assert.equal(rootPackage.private, true)
  assert.match(workspace, /packages:\n\s+- "packages\/\*"/)
  assert.equal(
    (rootPackage.dependencies as Record<string, unknown>)["@aqualy/ui"],
    "workspace:*",
  )
  assert.equal(componentsJson.style, "base-nova")
  assert.deepEqual(componentsJson.aliases, {
    components: "#components",
    utils: "#lib/utils",
    ui: "#components",
    lib: "#lib",
    hooks: "#hooks",
  })
  assert.deepEqual(packageJson.imports, {
    "#components/*": "./dist/components/*.js",
    "#lib/*": "./dist/lib/*.js",
    "#hooks/*": "./dist/hooks/*.js",
  })
  assert.doesNotMatch(componentsSource, /@\//)
  assert.doesNotMatch(tsconfigSource, /@\//)
})

test("legacy and canonical UI configurations remain distinct", () => {
  const rootComponents = readJson(join(repositoryRoot, "config/legacy-ui-baseline.json"))
  const packageComponents = readJson(join(packageRoot, "components.json"))
  const rootAliases = rootComponents.aliases as Record<string, unknown>

  assert.equal(rootComponents.style, "radix-nova")
  assert.equal(rootAliases.components, "@/components")
  assert.equal(rootAliases.ui, "@/components/ui")
  assert.equal(packageComponents.style, "base-nova")
  assert.deepEqual(packageComponents.aliases, {
    components: "#components",
    utils: "#lib/utils",
    ui: "#components",
    lib: "#lib",
    hooks: "#hooks",
  })
})

test("package source has no legacy, app, domain, or infrastructure imports", () => {
  const forbiddenImport =
    /from\s+["']@\//

  const forbiddenDependency =
    /@\/components\/ui|components\/ui|schemas\/phone|features\/|(?:^|["'])app\/|@prisma|prisma|better-auth|cookies|\bstripe\b|database/i

  for (const path of packageFiles(join(packageRoot, "src")).filter(path => /\.(?:ts|tsx|css)$/.test(path))) {
    const source = readFileSync(path, "utf8")
    assert.doesNotMatch(source, forbiddenImport, path)
    assert.doesNotMatch(source, forbiddenDependency, path)
  }
})

test("every Base UI portal carries the package-owned target portal scope", () => {
  const componentFiles = packageFiles(join(packageRoot, "src"))
  const portalFiles = componentFiles.filter((path) =>
    readFileSync(path, "utf8").includes(".Portal"),
  )

  assert.deepEqual(
    portalFiles.map((path) => path.split("/").at(-1)).sort(),
    ["action-menu.tsx", "alert-dialog.tsx", "calendar-operations.tsx", "combobox.tsx", "command.tsx", "dialog.tsx", "drawer.tsx", "input-group.tsx", "multi-select.tsx", "navigation-menu.tsx", "navigation-menu.tsx", "popover.tsx", "select.tsx", "sheet.tsx", "toast.tsx", "tooltip.tsx"],
  )

  for (const path of portalFiles) {
    assert.match(readFileSync(path, "utf8"), /AqualyUIPortalScope/, path)
  }

  const theme = readFileSync(join(packageRoot, "src/styles/aqualy-ui.css"), "utf8")
  assert.match(theme, /\[data-aqualy-ui-portal\]/)
})

test("package theme is scoped and does not redefine global legacy tokens", () => {
  const theme = readFileSync(join(packageRoot, "src/styles/aqualy-ui.css"), "utf8")

  assert.match(theme, /\[data-aqualy-ui\]/)
  assert.match(theme, /\.dark \[data-aqualy-ui\]/)
  assert.doesNotMatch(theme, /(^|\n)\s*:root\s*\{/m)
  assert.doesNotMatch(theme, /(^|\n)\s*\.dark\s*\{/m)
})

test("public export map exposes only canonical package subpaths", () => {
  const packageJson = readJson(join(packageRoot, "package.json"))
  const exports = packageJson.exports as Record<string, unknown>
  const expected = [
    "./components/button",
    "./components/field",
    "./components/input",
    "./components/label",
    "./components/phone-input",
    "./components/popover",
    "./components/select",
    "./components/separator",
    "./components/spinner",
    "./components/aqualy-ui-scope",
    "./components/aqualy-ui-portal",
    "./lib/utils",
    "./styles.css",
    "./components/accordion",
    "./components/alert-dialog",
    "./components/alert",
    "./components/aspect-ratio",
    "./components/avatar",
    "./components/badge",
    "./components/breadcrumb",
    "./components/calendar",
    "./components/card",
    "./components/carousel",
    "./components/chart",
    "./components/checkbox",
    "./components/combobox",
    "./components/command",
    "./components/data-table",
    "./components/description-list",
    "./components/dialog",
    "./components/sheet",
    "./components/drawer",
    "./components/dropdown-menu",
    "./components/context-menu",
    "./components/empty",
    "./components/error-state",
    "./components/file-upload",
    "./components/hover-card",
    "./components/input-group",
    "./components/input-otp",
    "./components/currency-input",
    "./components/address-input",
    "./components/loading",
    "./components/menubar",
    "./components/metric-card",
    "./components/multi-select",
    "./components/navigation-menu",
    "./components/number-input",
    "./components/pagination",
    "./components/progress",
    "./components/radio-group",
    "./components/resizable",
    "./components/scroll-area",
    "./components/search",
    "./components/sidebar",
    "./components/skeleton",
    "./components/slider",
    "./components/switch",
    "./components/tabs",
    "./components/textarea",
    "./components/timeline",
    "./components/toast",
    "./components/toggle",
    "./components/toggle-group",
    "./components/tooltip",
    "./components/tree",



  ]

  assert.deepEqual(Object.keys(exports).sort(), expected.sort())
  assert.ok(!Object.keys(exports).some((path) => path.includes("src")))

  const packageSource = readFileSync(join(packageRoot, "package.json"), "utf8")
  assert.equal(
    packageSource.match(/"\.\/components\/label"/g)?.length,
    1,
    "label export key must appear exactly once",
  )
})
