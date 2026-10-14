# @aqualy/ui source distribution

MIT React components maintained by Aqualy. This source snapshot is generated from the canonical private Brand & Design repository; it is not a second editable SDK authority. Public source mirror: [aqualyteam/aqualy-ui](https://github.com/aqualyteam/aqualy-ui). `aqualy-design` remains private and owns all editable source. This repository contains reviewed snapshots with a separate public history; it does not contain private audit records, official artwork or the original Git history.

Use Node24.18.0 and pnpm10.24.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm verify:public
pnpm test:consumer --registry
```

The registry mode installs the exact npm version 0.1.0-next.0 in a new external Next.js project and empty store, then performs a second frozen-lockfile install in another empty store; no private directories, original Git history, consumer overrides, SDK read token or Tailwind are required. Package LICENSE is included. Fonts retain OFL; other dependencies retain original licenses. Public-source-manifest.json records relative paths/hashes; it never includes private paths.

Use component subpaths, import @aqualy/ui/styles.css once and mount AqualyUIScope with product/theme/dir. Core Loading has a neutral identity; render a custom identity from a client adapter. Official Aqualy Q/wordmark artwork is excluded. Brand marks are governed separately by BRAND_USAGE.md; code/tokens/CSS remain commercially reusable MIT.

See packages/aqualy-ui/README.md, SUPPORT.md and CONTRIBUTING.md. Code/API/visual changes require tests and a changeset. Maintainers prioritize Aqualy products. The first public candidate is published as @aqualy/ui@0.1.0-next.0. Further publication remains blocked until a separate approved release. Always install the exact version; tags are mutable aliases.

The default branch is locked after CI acceptance. Maintainers refresh it only from an approved canonical-source snapshot, validate CI and restore the lock. Community patches are reviewed and applied to canonical source first; direct public merges and automatic releases are disabled. Independent MIT forks remain permitted.

Security reports: use [Report a vulnerability](https://github.com/aqualyteam/aqualy-ui/security/advisories/new). The private reporting channel is enabled. The package is a prerelease candidate; no stable release is asserted.

C1 bootstrap published the retained Linux archive built from 70e1789568621cbef493cd5319b4556cb5704634; SHA256948552994c0dfc74e15653268872a816f2e2821adc40fcaf6687dc6a453bb48c. npm automatically added latest alongside next and rejected authenticated deletion with HTTP400. The owner explicitly accepts this first-package tag exception only for that version/archive; it is not a stable release or publication authorization. config/registry-consumer.json binds the exception and exact expected tags. Original failed removal evidence remains private and unchanged.

C2 CI verifies anonymous registry metadata/download, exact version/URL/integrity in the generated lockfile, all 171 installed member hashes, 66 imports, single React, declarations/Next production build/SSR/fonts and 36 product/theme/direction/viewport combinations with 10 overlay cycles. No SDK read token, local tarball fallback or consumer overrides. The original C1 next-only assertion remains strict; C2 separately consumes the accepted exception. publish.yml is statically disabled and release-policy.json has no approved publication artifact. No new npm version, OIDC binding, deployment or product dependency switch is authorized. See [the release runbook](docs/release/PUBLIC_RELEASE_RUNBOOK.zh-CN.md).
