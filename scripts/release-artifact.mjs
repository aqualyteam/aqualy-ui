import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const policy = JSON.parse(await readFile(resolve(root, 'config/release-policy.json'), 'utf8'));
export const digest = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
export const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

export function assertToolchain() {
  assert.equal(process.versions.node, policy.node);
  for (const name of ['pnpm', 'npm']) {
    assert.equal(execFileSync(name, ['--version'], { encoding: 'utf8' }).trim(), policy[name], name);
  }
}

export async function inspectTarball(path) {
  assert.ok((await lstat(path)).isFile(), 'Tarball must be a regular file');
  const bytes = await readFile(path);
  const members = execFileSync('tar', ['-tzf', path], { encoding: 'utf8' }).trim().split('\n');
  assert.equal(members.length, 171, 'Reviewed package file count');
  assert.equal(new Set(members).size, members.length, 'Duplicate archive members');
  const listing = execFileSync('tar', ['-tvzf', path], { encoding: 'utf8' }).trim().split('\n');
  assert.ok(listing.every(line => line.startsWith('-')), 'No directories, symlinks or hardlinks');
  const read = name => execFileSync('tar', ['-xOf', path, name], { maxBuffer: 20 * 1024 * 1024 });
  for (const name of members) {
    assert.ok(!name.split('/').includes('..') && !name.includes('\\'));
    assert.match(name, /^package\/(?:dist\/[^\s]+|package\.json|README\.md|LICENSE|THIRD_PARTY_NOTICES\.md|CHANGELOG\.md)$/);
  }
  const metadata = JSON.parse(read('package/package.json'));
  assert.equal(metadata.name, policy.packageName);
  assert.equal(metadata.version, policy.version);
  assert.equal(metadata.license, 'MIT');
  assert.deepEqual(metadata.publishConfig, { registry: policy.registry, access: policy.access });
  assert.equal(metadata.repository.url, `https://github.com/${policy.repository}.git`);
  assert.equal(Object.keys(metadata.exports).length, 66);
  for (const entry of Object.values(metadata.exports)) {
    for (const target of typeof entry === 'string' ? [entry] : Object.values(entry)) {
      assert.ok(members.includes('package/' + target.slice(2)), target);
    }
  }
  assert.match(read('package/LICENSE').toString(), /MIT License/);
  assert.ok(members.filter(name => name.endsWith('.woff2')).length === 4);
  const files = members.sort().map(path => ({ path, sha256: digest(read(path)) }));
  return { filename: basename(path), sha256: digest(bytes), integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'), bytes: bytes.length, files };
}

export async function verifyReceipt(path, expectedSource, expectedSha256) {
  assert.match(expectedSource, /^[a-f0-9]{40}$/);
  assert.match(expectedSha256, /^[a-f0-9]{64}$/);
  const receipt = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(receipt.format, 1);
  assert.equal(receipt.status, 'validated-unpublished');
  assert.equal(receipt.repository, policy.repository);
  assert.equal(receipt.sourceCommit, expectedSource);
  assert.match(receipt.sourceManifestSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(receipt.toolchain, { node: policy.node, pnpm: policy.pnpm, npm: policy.npm });
  assert.equal(receipt.publication, false);
  for (const key of ['packageName', 'version', 'tag', 'registry', 'access']) assert.equal(receipt[key], policy[key], key);
  assert.equal(receipt.tarball.filename, `aqualy-ui-${policy.version}.tgz`);
  assert.equal(receipt.tarball.sha256, expectedSha256);
  assert.equal(receipt.validation.typesAndNextBuild, 'PASS');
  assert.equal(receipt.validation.exports, 66);
  assert.equal(receipt.validation.singleReact, true);
  const matrix = receipt.validation.matrices;
  assert.equal(matrix.length, 36);
  const seen = new Set();
  for (const row of matrix) {
    assert.ok(['desktop', 'mobile', 'narrow'].includes(row.name));
    assert.ok(['workspace', 'professional', 'diver'].includes(row.product));
    assert.ok(['light', 'dark'].includes(row.theme));
    assert.ok(['ltr', 'rtl'].includes(row.dir));
    assert.equal(row.status, 'PASS');
    assert.equal(row.sequentialCycles, 10);
    seen.add([row.name, row.product, row.theme, row.dir].join('/'));
  }
  assert.equal(seen.size, 36);
  const actual = await inspectTarball(resolve(dirname(path), receipt.tarball.filename));
  assert.deepEqual(actual, receipt.tarball, 'Exact tested tarball and all member hashes');
  return receipt;
}

export function assertPublishAuthorized(source, sha256, mode = 'oidc', authorization = policy) {
  assert.equal(authorization.publishEnabled, true, 'Publication is disabled; separate exact-artifact authorization required');
  assert.equal(source, authorization.approvedSource, 'Approved source commit required');
  assert.equal(sha256, authorization.approvedSha256, 'Approved exact artifact required');
  assert.equal(mode, authorization.approvedMode, 'Approved publication mode required');
}
