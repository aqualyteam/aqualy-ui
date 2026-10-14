import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm, mkdir } from 'node:fs/promises';
import { spawnSync, execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { root, policy, inspectTarball, verifyReceipt, assertPublishAuthorized } from '../../scripts/release-artifact.mjs';

let directory, tarball, receipt;
before(async () => {
  directory = await mkdtemp('/tmp/aqualy-release-contract-');
  execFileSync('pnpm', ['--filter', '@aqualy/ui', 'pack', '--pack-destination', directory], { cwd: root, stdio: 'pipe' });
  tarball = resolve(directory, `aqualy-ui-${policy.version}.tgz`);
  receipt = { format: 1, status: 'validated-unpublished', repository: policy.repository, sourceCommit: 'a'.repeat(40), sourceManifestSha256: 'a'.repeat(64), toolchain: { node: policy.node, pnpm: policy.pnpm, npm: policy.npm }, publication: false, packageName: policy.packageName, version: policy.version, tag: policy.tag, registry: policy.registry, access: policy.access, tarball: await inspectTarball(tarball), validation: { typesAndNextBuild: 'PASS', exports: 66, singleReact: true, matrices: ['desktop', 'mobile', 'narrow'].flatMap(name => ['workspace', 'professional', 'diver'].flatMap(product => ['light', 'dark'].flatMap(theme => ['ltr', 'rtl'].map(dir => ({ name, product, theme, dir, status: 'PASS', sequentialCycles: 10 }))))) } };
});
after(async () => { await rm(directory, { recursive: true }); });
async function check(value = receipt, source = receipt.sourceCommit, sha = receipt.tarball.sha256) {
  const path = resolve(directory, 'release-receipt.json');
  await writeFile(path, JSON.stringify(value));
  return verifyReceipt(path, source, sha);
}

test('unpublished exact candidate has reviewed licenses, exports and all member hashes', async () => {
  assert.equal((await check()).tarball.files.length, 171);
  assert.equal(policy.publishEnabled, false);
  assert.equal(policy.approvedSource, null);
  assert.equal(policy.approvedSha256, null);
});
test('wrong artifact hash, source and package identity are rejected', async () => {
  await assert.rejects(check(receipt, 'b'.repeat(40)));
  await assert.rejects(check(receipt, receipt.sourceCommit, 'b'.repeat(64)));
  await assert.rejects(check({ ...receipt, packageName: '@other/ui' }));
  await assert.rejects(check({ ...receipt, version: '0.1.0' }));
  await assert.rejects(check({ ...receipt, tag: 'latest' }));
});
test('unvalidated, incomplete or duplicate matrix evidence is rejected', async () => {
  await assert.rejects(check({ ...receipt, status: 'packed' }));
  await assert.rejects(check({ ...receipt, validation: { ...receipt.validation, typesAndNextBuild: 'FAIL' } }));
  await assert.rejects(check({ ...receipt, validation: { ...receipt.validation, matrices: receipt.validation.matrices.slice(1) } }));
  await assert.rejects(check({ ...receipt, validation: { ...receipt.validation, matrices: receipt.validation.matrices.map(() => receipt.validation.matrices[0]) } }));
});
test('archive path substitution and changed member digest are rejected', async () => {
  await assert.rejects(check({ ...receipt, tarball: { ...receipt.tarball, filename: '../other.tgz' } }));
  const changed = structuredClone(receipt); changed.tarball.files[0].sha256 = 'b'.repeat(64);
  await assert.rejects(check(changed));
});
test('modified archive bytes are rejected even if a receipt is unchanged', async () => {
  const original = await readFile(tarball);
  await writeFile(tarball, Buffer.concat([original, Buffer.from('tampered')]));
  try { await assert.rejects(check()); } finally { await writeFile(tarball, original); }
});
test('registry publication cannot be enabled by flags, auth environment or dispatch inputs', async () => {
  assert.throws(() => assertPublishAuthorized('a'.repeat(40), 'a'.repeat(64)), /Publication is disabled/);
  const fakeBin = resolve(directory, 'bin'); await mkdir(fakeBin);
  for (const mode of ['--bootstrap', '--oidc']) {
    const result = spawnSync(process.execPath, [resolve(root, 'scripts/publish-release.mjs'), mode], {
      env: { ...process.env, PATH: fakeBin, AQUALY_RELEASE_SOURCE: 'a'.repeat(40), AQUALY_RELEASE_SHA256: 'a'.repeat(64), AQUALY_PUBLISH_ENABLED: 'true', GITHUB_ACTIONS: 'true', NODE_AUTH_TOKEN: 'synthetic-invalid-credential' }, encoding: 'utf8'
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Publication is disabled/);
    assert.doesNotMatch(result.stderr, /ENOENT|fetch failed/);
  }
});
test('OIDC workflow is manual and statically disabled; preparation has no write permissions', async () => {
  const prefix = await readFile(resolve(root, 'package.json'), 'utf8');
  const base = JSON.parse(prefix).name === 'aqualy-design' ? 'public-distribution/workflows' : '.github/workflows';
  const publish = await readFile(resolve(root, base, 'publish.yml'), 'utf8');
  const prepare = await readFile(resolve(root, base, 'prepare-release.yml'), 'utf8');
  assert.match(publish, /if: \$\{\{ false \}\}/);
  assert.match(publish, /environment: npm-release/);
  const jobEnvironment = publish.slice(publish.indexOf('    env:'), publish.indexOf('    steps:'));
  assert.doesNotMatch(jobEnvironment, /runner\./, 'runner context is available in steps, not jobs.env');
  assert.match(publish, /cancel-in-progress: false/);
  assert.doesNotMatch(publish, /pull_request_target|secrets\.|npm publish|--ignore-scripts/);
  assert.match(prepare, /workflow_dispatch:/);
  assert.doesNotMatch(prepare, /id-token:|contents: write|npm publish|secrets\./);
  assert.match(publish, /verify-release-run\.mjs/);
  assert.match(publish, /verify-candidate\.mjs --authorized/);
  assert.match(publish, /verify-registry-release\.mjs/);
  for (const source of [publish, prepare]) {
    for (const match of source.matchAll(/uses: ([^\s]+)@([^\s]+)/g)) assert.match(match[2], /^[a-f0-9]{40}$/);
    assert.match(source, /package-manager-cache: false/);
    assert.match(source, /persist-credentials: false/);
  }
});
