# Contributing

Aqualy products are the first consumers of this React UI library. Commercial use and forks of MIT code are permitted. Contributions must be code/data you can legally offer under the project's MIT license; preserve third-party attribution. Official brand artwork is governed separately by BRAND_USAGE.md.

Use the pinned Node 24.18.0 and pnpm 10.24.0. Run pnpm install --frozen-lockfile, pnpm test, pnpm typecheck and the public-source/package checks documented in README. Add a changeset for meaningful public API/visual changes. Consumer routing, data, authentication and payment logic do not belong in the SDK.

Explain expected behavior, keyboard/mobile/RTL impact and validation. Avoid breaking existing subpaths. External PRs do not receive publishing secrets and are never automatically published. Maintainers choose roadmap and release timing; there is no support SLA. The public source mirror is available; the npm package remains unpublished.

The public source repository is a generated release mirror. Issues and proposed patches are welcome; maintainers apply accepted changes in the canonical private source and regenerate the mirror. Direct public merges are not the source of release truth. A fork may be independently modified under MIT.
