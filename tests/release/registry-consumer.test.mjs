import test from 'node:test';
import assert from 'node:assert/strict';
import { registryCandidate, validateRegistryContract, assertRegistryTags, anonymousEnvironment, assertRegistryLockfile } from '../../scripts/registry-contract.mjs';

test('first-package latest exception is bound to the approved version and exact archive', () => {
  assert.doesNotThrow(() => validateRegistryContract());
  for (const key of ['version', 'sha256', 'integrity', 'buildSource']) {
    assert.throws(() => validateRegistryContract({ ...registryCandidate, [key]: 'unapproved' }));
  }
  assert.throws(() => validateRegistryContract({ ...registryCandidate, exception: { ...registryCandidate.exception, acceptedByOwner: false } }));
  assert.throws(() => validateRegistryContract({ ...registryCandidate, exception: { ...registryCandidate.exception, publicationAuthorization: true } }));
});
test('tag exception rejects promotion, extra tags and a changed next target', () => {
  assert.doesNotThrow(() => assertRegistryTags(registryCandidate.expectedTags));
  for (const tags of [{ next: '0.1.0' }, { next: registryCandidate.version, latest: '0.1.0' }, { ...registryCandidate.expectedTags, beta: registryCandidate.version }]) assert.throws(() => assertRegistryTags(tags));
});
test('anonymous environment removes inherited credentials and npm configuration without changing its parent', () => {
  const parent = { PATH: '/bin', HOME: '/tmp/home', NPM_TOKEN: 'synthetic', npm_config_userconfig: 'inherited', PNPM_HOME: 'inherited', GITHUB_TOKEN: 'synthetic', NODE_AUTH_TOKEN: 'synthetic', NODE_OPTIONS: '--require inherited', OTHER_SECRET: 'synthetic' };
  const env = anonymousEnvironment(parent, '/tmp/isolated');
  assert.equal(env.HOME, parent.HOME);
  assert.equal(env.PATH, parent.PATH);
  assert.equal(env.NPM_CONFIG_USERCONFIG, '/tmp/isolated/anonymous.npmrc');
  for (const key of ['NPM_TOKEN', 'npm_config_userconfig', 'PNPM_HOME', 'GITHUB_TOKEN', 'NODE_AUTH_TOKEN', 'NODE_OPTIONS', 'OTHER_SECRET']) assert.ok(!(key in env));
  assert.equal(parent.NPM_TOKEN, 'synthetic');
});
test('registry lockfile rejects local fallback, wrong integrity and a floating SDK version', () => {
  const lock = `importers:\n  .:\n    dependencies:\n      '@aqualy/ui':\n        specifier: ${registryCandidate.version}\n        version: ${registryCandidate.version}(react@19.2.1)\n      next:\n        specifier: 16.0.10\npackages:\n  '@aqualy/ui@${registryCandidate.version}':\n    resolution: {integrity: ${registryCandidate.integrity}, tarball: https://registry.npmjs.org/@aqualy/ui/-/ui-0.1.0-next.0.tgz}\n  next@16.0.10:\n    resolution: {}\n`;
  assert.doesNotThrow(() => assertRegistryLockfile(lock));
  assert.doesNotThrow(() => assertRegistryLockfile('settings:\n  excludeLinksFromLockfile: false\n'+lock));
  for (const changed of [lock.replace('specifier: '+registryCandidate.version, 'specifier: ^0.1.0'), lock.replace(registryCandidate.integrity, 'sha512-wrong'), lock+'\nlink: ./local\n']) assert.throws(() => assertRegistryLockfile(changed));
});
