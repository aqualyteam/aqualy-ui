# @aqualy/ui source distribution

MIT React components maintained by Aqualy. This source snapshot is generated from the canonical private Brand & Design repository; it is not a second editable SDK authority. Public source mirror: [aqualyteam/aqualy-ui](https://github.com/aqualyteam/aqualy-ui). `aqualy-design` remains private and owns all editable source. This repository contains reviewed snapshots with a separate public history; it does not contain private audit records, official artwork or the original Git history.

Use Node24.18.0 and pnpm10.24.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm verify:public
pnpm test:consumer
```

The external Next.js consumer installs a real tarball; no private directories, original Git history, consumer overrides, SDK read token or Tailwind are required. Package LICENSE is included. Fonts retain OFL; other dependencies retain original licenses. Public-source-manifest.json records relative paths/hashes; it never includes private paths.

Use component subpaths, import @aqualy/ui/styles.css once and mount AqualyUIScope with product/theme/dir. Core Loading has a neutral identity; render a custom identity from a client adapter. Official Aqualy Q/wordmark artwork is excluded. Brand marks are governed separately by BRAND_USAGE.md; code/tokens/CSS remain commercially reusable MIT.

See packages/aqualy-ui/README.md, SUPPORT.md and CONTRIBUTING.md. Code/API/visual changes require tests and a changeset. Maintainers prioritize Aqualy products. This candidate is unpublished and publication is blocked until a separate approved release.

The default branch is locked after CI acceptance. Maintainers refresh it only from an approved canonical-source snapshot, validate CI and restore the lock. Community patches are reviewed and applied to canonical source first; direct public merges and automatic releases are disabled. Independent MIT forks remain permitted.

Security reports: use [Report a vulnerability](https://github.com/aqualyteam/aqualy-ui/security/advisories/new). The private reporting channel is enabled. No npm package version has been published by this project.
