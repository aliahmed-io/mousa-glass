# CI runtime upgrade sources

The following official sources were reviewed on 24 August 2026 before updating the CI action pins.

| Source | Relevant guidance | Intended project use |
| --- | --- | --- |
| [GitHub Actions Node 20 deprecation notice](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/) | GitHub instructs workflow users to update to the latest action versions that run on Node 24. | Replace runtime-legacy action pins rather than opting out to an insecure legacy runtime. |
| [actions/checkout README](https://github.com/actions/checkout) | Checkout v5 and later use the Node 24 action runtime; the current maintained usage is newer still. | Upgrade checkout from the legacy v4 runtime pin using no workflow-input changes. |
| [actions/setup-node README](https://github.com/actions/setup-node) | Setup-node v5 upgraded action internals from Node 20 to Node 24. | Upgrade setup-node from v4 while retaining the existing Node version and pnpm cache inputs. |
| [pnpm/action-setup README](https://github.com/pnpm/action-setup) | The maintained action-setup v6 documentation retains pnpm v10 support; its v11-only successor is not appropriate for a pnpm 10 project. | Upgrade the action pin without changing the project package-manager major version or install semantics. |

The project uses GitHub-hosted runners, so the documented minimum runner versions for Node 24-capable action majors are supplied by the managed platform. The workflow will still be validated on its non-default verified snapshot branch before this is considered resolved.

## Administrator authorization CI evidence

The administrator passphrase path requires both a verification value and a cookie-signing value. Managed project secrets are deliberately unavailable to the GitHub-hosted runner, so the validation workflow supplies **test-only** values for `ADMIN_ACCESS_PASSPHRASE` and `JWT_SECRET`. These values exist solely inside the hosted test job, are not the project’s managed runtime credentials, and permit coverage of the signed, user-bound administrator cookie rather than weakening that check.

| Snapshot branch | Commit | Hosted run | Result | Verified workflow stages |
| --- | --- | --- | --- | --- |
| `production-readiness-verified-4211f37` | `b6539854` | [32680175269](https://github.com/aliahmed-io/mousa-glass/actions/runs/32680175269) | Success | Install, production audit, type check, 66 tests, and production build. |
| `production-readiness-verified-4211f37` | `b9a5e3fe` | [32680585521](https://github.com/aliahmed-io/mousa-glass/actions/runs/32680585521) | Success | Install, production audit, type check, 66 tests, and production build after the source-map and stylesheet render-path evidence updates. |

The preceding two snapshot runs documented the expected missing-test-environment diagnosis: one lacked the test passphrase and one lacked the test cookie-signing secret. Neither run exposed a managed credential. The two subsequent successful runs confirm that the repaired workflow exercises the authorization-cookie acceptance path with isolated inputs while the GitHub default branch remains unchanged.

## Workspace configuration validation evidence

| Snapshot branch | Commit | Hosted run | Result | Verified workflow stages |
| --- | --- | --- | --- | --- |
| `production-readiness-verified-4211f37` | `32bd34e3` | [32681035416](https://github.com/aliahmed-io/mousa-glass/actions/runs/32681035416) | Success | Frozen dependency installation, production audit, type check, 66 tests, and production build. |
| `production-readiness-verified-4211f37` | `338253cf` | [32681226485](https://github.com/aliahmed-io/mousa-glass/actions/runs/32681226485) | Success | Frozen dependency installation, production audit, type check, 66 tests, and production build after the public administrator-access query reassessment. |

These runs validate the supported `pnpm-workspace.yaml` migration on a clean GitHub-hosted runner and retain validation coverage through the later public administrator-access query assessment. In particular, the frozen installation step confirms that regenerated lockfile metadata is reproducible without relying on ignored package configuration or managed project runtime secrets. The default branch remains untouched.
