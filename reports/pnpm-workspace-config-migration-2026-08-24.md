# pnpm Workspace Configuration Migration

## Purpose

pnpm 10 no longer reads the project’s `pnpm.patchedDependencies` and `pnpm.overrides` fields from `package.json`. The project actively depends on both settings: the Wouter patch provides route-discovery instrumentation, and the Tailwind-to-NanoID override is recorded in the lockfile. Leaving the configuration in its ignored location would make future dependency installations less reproducible.

## Migrated configuration

| Setting | Previous location | Supported location | Validation |
| --- | --- | --- | --- |
| Single-package workspace declaration | Not present | `pnpm-workspace.yaml` `packages: ['.']` | Required by pnpm before workspace settings can be applied. |
| Wouter patch | Ignored `package.json` `pnpm.patchedDependencies` | `pnpm-workspace.yaml` `patchedDependencies` | Installed `wouter@3.7.1` still contains the `__WOUTER_ROUTES__` patch marker. |
| Tailwind NanoID override | Ignored `package.json` `pnpm.overrides` | `pnpm-workspace.yaml` `overrides` | Lockfile metadata was regenerated and a frozen installation completed successfully. |

## Verification

The first frozen installation correctly rejected the old lockfile metadata after configuration ownership changed. A non-frozen installation regenerated that metadata, after which `pnpm install --frozen-lockfile` completed successfully. The full staging-safe release gate then passed: production dependency audit, TypeScript check, **66 tests**, production build, and all twelve staged-media integrity checks.

The migration removes the pnpm ignored-configuration warning without changing application source, authorization, staging mode, catalog content, payment settings, or ordering controls. The Vite large-chunk advisory remains documented separately as an evidence-backed performance gate; it is not hidden or suppressed by this configuration repair.
