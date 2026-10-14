import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { policy, git, assertToolchain, assertPublishAuthorized, verifyReceipt } from './release-artifact.mjs';

// This gate runs before npm, network access or credential use. C1 preparation keeps it false.
const source = process.env.AQUALY_RELEASE_SOURCE;
const sha = process.env.AQUALY_RELEASE_SHA256;
assertPublishAuthorized(source, sha);
assert.equal(git('status', '--porcelain'), '', 'Reviewed clean publisher checkout required');
assert.ok(process.argv.length === 3 && ['--bootstrap', '--oidc'].includes(process.argv[2]), 'Explicit publication mode required');
assertToolchain();
const directory = process.env.AQUALY_ARTIFACT_DIRECTORY;
assert.ok(directory);
const receipt = await verifyReceipt(resolve(directory, 'release-receipt.json'), source, sha);
const oidc = process.argv[2] === '--oidc';
if (oidc) {
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.GITHUB_REPOSITORY, policy.repository);
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
  assert.equal(process.env.GITHUB_WORKFLOW_REF, `${policy.repository}/.github/workflows/${policy.workflow}@refs/heads/main`);
  assert.ok(process.env.ACTIONS_ID_TOKEN_REQUEST_URL && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'OIDC required');
  assert.ok(!process.env.NODE_AUTH_TOKEN && !process.env.NPM_TOKEN && !process.env.NPM_AUTH_TOKEN, 'No token fallback');
} else {
  assert.notEqual(process.env.GITHUB_ACTIONS, 'true', 'First-package bootstrap is interactive, outside CI');
  assert.equal(execFileSync('npm', ['whoami', '--registry', policy.registry], { encoding: 'utf8' }).trim(), policy.bootstrapUser);
  const roles = JSON.parse(execFileSync('npm', ['org', 'ls', 'aqualy', policy.bootstrapUser, '--json', '--registry', policy.registry], { encoding: 'utf8' }));
  assert.equal(roles[policy.bootstrapUser], 'owner');
}
const metadata = await fetch(`${policy.registry}@aqualy%2Fui/${policy.version}`);
assert.equal(metadata.status, 404, 'Existing version or unexpected registry response; stop and reconcile');
// Publish the inspected tarball directly; no ignore-scripts, source-directory publish or rebuild.
execFileSync('npm', ['publish', resolve(directory, receipt.tarball.filename), '--tag', policy.tag, '--access', policy.access, '--registry', policy.registry, ...(oidc ? ['--provenance'] : [])], { stdio: 'inherit' });
console.log('Uploaded; anonymous readback, integrity and provenance must still be verified separately.');
