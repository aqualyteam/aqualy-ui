import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, policy } from './release-artifact.mjs';

export const registryCandidate = JSON.parse(await readFile(resolve(root, 'config/registry-consumer.json'), 'utf8'));

export function validateRegistryContract(candidate = registryCandidate) {
  assert.equal(candidate.format, 1);
  assert.equal(candidate.packageName, '@aqualy/ui');
  assert.equal(candidate.version, '0.1.0-next.0');
  assert.equal(candidate.registry, 'https://registry.npmjs.org/');
  assert.equal(candidate.buildSource, '70e1789568621cbef493cd5319b4556cb5704634');
  assert.equal(candidate.sha256, '948552994c0dfc74e15653268872a816f2e2821adc40fcaf6687dc6a453bb48c');
  assert.equal(candidate.integrity, 'sha512-t0V/hVGNDPeQbJUSbh5kRbAhn4Qs/6gc+aAV+2ZH8ja7/Mb7GNV3EPQgsFK7UC2e+v3CvqZkUlk3lZ1TDHg58A==');
  assert.deepEqual(candidate.expectedTags, { next: candidate.version, latest: candidate.version });
  assert.equal(candidate.exception.id, 'C1-FIRST-PACKAGE-LATEST');
  assert.equal(candidate.exception.acceptedByOwner, true);
  assert.equal(candidate.exception.stableRelease, false);
  assert.equal(candidate.exception.publicationAuthorization, false);
  assert.equal(policy.publishEnabled, false, 'Registry consumption does not authorize publication');
  assert.equal(policy.approvedSource, null);
  assert.equal(policy.approvedSha256, null);
  assert.equal(policy.approvedMode, null);
  return candidate;
}

export function assertRegistryTags(tags, candidate = registryCandidate) {
  validateRegistryContract(candidate);
  assert.deepEqual(tags, candidate.expectedTags, 'Exact approved first-bootstrap tag exception only');
}

export function anonymousEnvironment(parent, directory) {
  const env = { ...parent };
  for (const key of Object.keys(env)) {
    if (/^(?:npm_config_|pnpm_|node_options$)/i.test(key) || /(?:token|auth|secret|password)/i.test(key)) delete env[key];
  }
  return { ...env, NPM_CONFIG_USERCONFIG: resolve(directory, 'anonymous.npmrc'), NPM_CONFIG_GLOBALCONFIG: resolve(directory, 'anonymous-global.npmrc'), NPM_CONFIG_REGISTRY: 'https://registry.npmjs.org/' };
}

export function assertRegistryLockfile(lock, candidate = registryCandidate) {
  validateRegistryContract(candidate);
  assert.ok(!/\b(?:workspace:|file:|link:)/.test(lock), 'No local or workspace resolution in registry consumer');
  const importer = lock.match(/      '@aqualy\/ui':\n([\s\S]*?)(?=\n      \S|\n    \S)/)?.[1];
  assert.ok(importer, 'SDK importer required');
  assert.ok(importer.includes(`specifier: ${candidate.version}`), 'Exact SDK version required');
  assert.ok(importer.includes(`version: ${candidate.version}`));
  const entry = lock.match(/  '@aqualy\/ui@0\.1\.0-next\.0':\n([\s\S]*?)(?=\n  \S|$)/)?.[1];
  assert.ok(entry, 'Registry SDK package resolution required');
  assert.ok(entry.includes(candidate.integrity), 'Approved registry integrity required');
  assert.ok(entry.includes('https://registry.npmjs.org/@aqualy/ui/-/ui-0.1.0-next.0.tgz'), 'Explicit SDK registry tarball URL required');
}
