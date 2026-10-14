import assert from 'node:assert/strict';
import { mkdir, realpath, access, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, isAbsolute } from 'node:path';
import { root, policy, git, digest, assertToolchain, inspectTarball, verifyReceipt } from './release-artifact.mjs';

const args = process.argv.slice(2).filter(argument => argument !== '--');
assert.ok(args.length === 2 && args[0] === '--output' && isAbsolute(args[1]), 'Use --output <new absolute external directory>');
const output = resolve(await realpath(dirname(args[1])), args[1].split('/').at(-1));
assert.ok(!output.startsWith(root) && output !== root.replace(/\/$/, ''), 'Output must be external');
try { await access(output); throw new Error('Output already exists; no overwrite'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
assertToolchain();
assert.equal(git('status', '--porcelain'), '', 'Clean reviewed source required');
const sourceCommit = git('rev-parse', 'HEAD');
if (process.env.AQUALY_EXPECTED_SOURCE) assert.equal(sourceCommit, process.env.AQUALY_EXPECTED_SOURCE);
if (process.env.GITHUB_ACTIONS === 'true') {
  assert.equal(process.env.GITHUB_REPOSITORY, policy.repository);
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
  assert.equal(process.env.GITHUB_SHA, sourceCommit);
}
execFileSync(process.execPath, [resolve(root, 'scripts/verify-public-source.mjs')], { cwd: root, stdio: 'inherit' });
execFileSync('pnpm', ['verify:release'], { cwd: root, stdio: 'inherit' });
await mkdir(output);
execFileSync('pnpm', ['--filter', '@aqualy/ui', 'pack', '--pack-destination', output], { cwd: root, stdio: 'inherit' });
const tarball = resolve(output, `aqualy-ui-${policy.version}.tgz`);
const inspected = await inspectTarball(tarball);
// Consumer installs this exact archive; no second packing step is permitted.
execFileSync(process.execPath, [resolve(root, 'scripts/verify-c0-consumer.mjs'), '--tarball', tarball, '--evidence-output', resolve(output, 'consumer')], { cwd: root, stdio: 'inherit' });
assert.deepEqual(await inspectTarball(tarball), inspected, 'Candidate archive changed during validation');
const evidence = JSON.parse(await readFile(resolve(output, 'consumer/evidence.json'), 'utf8'));
assert.equal(evidence.tarballSha256, inspected.sha256);
for (const name of ['typecheck.log', 'next-build.log', 'install.log']) {
  assert.ok((await readFile(resolve(output, 'consumer', name), 'utf8')).length > 0, name);
}
const receipt = {
  format: 1, status: 'validated-unpublished', repository: policy.repository, sourceCommit,
  packageName: policy.packageName, version: policy.version, tag: policy.tag, registry: policy.registry, access: policy.access,
  sourceManifestSha256: digest(await readFile(resolve(root, 'public-source-manifest.json'))),
  toolchain: { node: policy.node, pnpm: policy.pnpm, npm: policy.npm },
  tarball: inspected,
  validation: { typesAndNextBuild: 'PASS', exports: evidence.exports, singleReact: evidence.reactDedup, matrices: evidence.results },
  publication: false, registryReadback: 'NOT RUN', provenance: 'NOT RUN'
};
await writeFile(resolve(output, 'release-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
await verifyReceipt(resolve(output, 'release-receipt.json'), sourceCommit, inspected.sha256);
await writeFile(resolve(output, 'SHA256SUMS'), `${inspected.sha256}  ${inspected.filename}\n`);
assert.equal(git('status', '--porcelain'), '', 'Preparation must not mutate reviewed source');
console.log(`PASS unpublished candidate ${policy.version}: ${inspected.sha256}; retained ${output}`);
