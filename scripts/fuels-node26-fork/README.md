# fuels packages republished for Node 26

`@sentio/sdk` depends on `@sentio/fuels` and `@sentio/fuel-ts-*` instead of the official `fuels` and
`@fuel-ts/*` packages. This directory holds the scripts that produced those packages, so anyone can
see how they were made and check that they match the official ones.

This is temporary. See [Switching back](#switching-back).

## Why

`fuels@0.103.0` and its 16 `@fuel-ts/*` packages declare
`engines.node` as `^20.0.0 || ^22.0.0 || ^24.0.0`. Yarn 1 treats an engines mismatch as an error, so
installing `@sentio/sdk` with Yarn 1 on Node 26 failed:

```
error fuels@0.103.0: The engine "node" is incompatible with this module. Expected version "^20.0.0 || ^22.0.0 || ^24.0.0". Got "26.13.0"
```

Only the declaration is wrong; the code runs on Node 26. Upstream has an open PR that adds Node 26
(https://github.com/FuelLabs/fuels-ts/pull/3980), but no release contains it yet.

## What the packages are

They are not built from source. Each one is the official `0.103.0` tarball from npm, republished
with three edits to `package.json` and no other change:

1. `name`: `fuels` becomes `@sentio/fuels`, `@fuel-ts/x` becomes `@sentio/fuel-ts-x`
2. `engines.node`: `^20.0.0 || ^22.0.0 || ^24.0.0 || ^26.0.0`
3. dependencies on `fuels` / `@fuel-ts/*`: the value becomes an `npm:` alias, the key stays

```diff
-  "name": "fuels",
+  "name": "@sentio/fuels",
   "engines": {
-    "node": "^20.0.0 || ^22.0.0 || ^24.0.0"
+    "node": "^20.0.0 || ^22.0.0 || ^24.0.0 || ^26.0.0"
   },
   "dependencies": {
-    "@fuel-ts/abi-coder": "0.103.0",
+    "@fuel-ts/abi-coder": "npm:@sentio/fuel-ts-abi-coder@0.103.0",
```

Because the dependency keys are unchanged, the packages still install as `node_modules/fuels` and
`node_modules/@fuel-ts/*`. Imports such as `from 'fuels'` in the SDK and in generated processor
code keep working.

The version stays `0.103.0`, matching upstream one to one. `@fuels/vm-asm` declares no engines and
is still the official package.

| Official                | Republished                    |
| ----------------------- | ------------------------------ |
| `fuels`                 | `@sentio/fuels`                |
| `@fuel-ts/abi-coder`    | `@sentio/fuel-ts-abi-coder`    |
| `@fuel-ts/abi-typegen`  | `@sentio/fuel-ts-abi-typegen`  |
| `@fuel-ts/account`      | `@sentio/fuel-ts-account`      |
| `@fuel-ts/address`      | `@sentio/fuel-ts-address`      |
| `@fuel-ts/contract`     | `@sentio/fuel-ts-contract`     |
| `@fuel-ts/crypto`       | `@sentio/fuel-ts-crypto`       |
| `@fuel-ts/errors`       | `@sentio/fuel-ts-errors`       |
| `@fuel-ts/hasher`       | `@sentio/fuel-ts-hasher`       |
| `@fuel-ts/math`         | `@sentio/fuel-ts-math`         |
| `@fuel-ts/merkle`       | `@sentio/fuel-ts-merkle`       |
| `@fuel-ts/program`      | `@sentio/fuel-ts-program`      |
| `@fuel-ts/recipes`      | `@sentio/fuel-ts-recipes`      |
| `@fuel-ts/script`       | `@sentio/fuel-ts-script`       |
| `@fuel-ts/transactions` | `@sentio/fuel-ts-transactions` |
| `@fuel-ts/utils`        | `@sentio/fuel-ts-utils`        |
| `@fuel-ts/versions`     | `@sentio/fuel-ts-versions`     |

## Files

| File                       | Purpose                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `packages.mjs`             | The package list, the name mapping and the versions                                          |
| `list.mjs`                 | Prints the package list for the shell scripts                                                |
| `repack.sh`                | Downloads the official tarballs, extracts them, rewrites `package.json`, packs with `tar`    |
| `rewrite-package-json.mjs` | Makes the three edits; aborts on any value it does not expect                                |
| `verify.mjs`               | Compares republished tarballs with the official ones file by file                            |
| `publish.sh`               | Publishes `work/dist/*.tgz`, dependencies first; skips versions already on the registry      |
| `verify-published.sh`      | Downloads the published packages back from npm and runs `verify.mjs` on them                 |
| `MANIFEST.txt`             | sha512 of each published tarball and of the official tarball it came from                    |

Everything the scripts download or produce goes under `work/`, which is git-ignored. Set `WORK_DIR`
to use another location.

The downloaded tarballs are treated as untrusted data. Each is extracted into its own directory
after its paths are checked, and nothing inside an extracted directory is ever executed: no
`npm install` or `npm pack` runs there, and `tar` does the packing.

## Checking the published packages

Requires Node, npm and `tar`. No dependencies are installed.

```bash
./repack.sh           # downloads the official tarballs into work/official
./verify-published.sh # downloads the 17 @sentio packages and compares them
```

For each package `verify.mjs` checks that:

- the file list is the same, there are no symlinks, and executable bits match
- every file other than `package.json` is byte-identical (sha256)
- `package.json` differs only in `name`, `engines.node` and the internal dependencies, with the key
  order unchanged
- the new `engines.node` accepts 26.13.0 and still accepts 20, 22 and 24

It prints the `package.json` diff of every package and exits non-zero on any mismatch.

`MANIFEST.txt` can also be checked against the registry directly. The `fork` line of a package
equals its `dist.integrity`, and the `official` line equals the `dist.integrity` of the upstream
package:

```bash
npm view @sentio/fuels@0.103.0 dist.integrity
npm view fuels@0.103.0 dist.integrity
```

`repack.sh` does not reproduce the published tarballs byte for byte, because `tar` records file
times. The extracted contents are what `verify.mjs` compares.

## Re-releasing

npm does not allow a published version to be replaced. To publish a corrected set, pick a new
version; it is applied to all 17 packages and to the aliases between them:

```bash
FORK_VERSION=0.103.1 ./repack.sh
FORK_VERSION=0.103.1 node verify.mjs
FORK_VERSION=0.103.1 ./publish.sh           # needs npm login with publish rights on @sentio
FORK_VERSION=0.103.1 ./verify-published.sh  # new packages can take a few minutes to appear
```

Then update `MANIFEST.txt` from `work/MANIFEST.txt` and the aliases in
`packages/sdk/package.json`.

## Known limitation

A project that depends on the official `fuels` package directly still hits the engines error with
Yarn 1 on Node 26. It can use the same alias, `"fuels": "npm:@sentio/fuels@0.103.0"`, until
upstream publishes a release that accepts Node 26.

## Switching back

Once upstream publishes a `fuels` release whose `engines.node` accepts Node 26:

1. In `packages/sdk/package.json`, point `fuels` and the three `@fuel-ts/*` entries back at the
   official packages and the new version.
2. After an SDK release with that change is out, deprecate the republished packages:
   `npm deprecate "@sentio/<name>@*" "Use the official fuels / @fuel-ts packages"`.
   Do not unpublish them; older SDK versions still depend on them.
3. Delete this directory.
