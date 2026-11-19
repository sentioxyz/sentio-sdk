// Prints one line per package: <upstream name>\t<slug>\t<fork tarball file name>
import { FORK_VERSION, UPSTREAM_NAMES, forkName, slug, tarballName } from './packages.mjs'

for (const n of UPSTREAM_NAMES) console.log([n, slug(n), tarballName(forkName(n), FORK_VERSION)].join('\t'))
