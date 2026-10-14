import assert from 'node:assert/strict';
import { policy, assertPublishAuthorized } from './release-artifact.mjs';

const source = process.env.AQUALY_RELEASE_SOURCE, sha = process.env.AQUALY_RELEASE_SHA256;
assertPublishAuthorized(source, sha);
const id = process.env.AQUALY_PREPARATION_RUN;
assert.match(id, /^\d+$/);
assert.equal(process.env.GITHUB_REPOSITORY, policy.repository);
assert.ok(process.env.GH_TOKEN);
async function api(path) {
  const response = await fetch(`https://api.github.com/repos/${policy.repository}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  });
  assert.equal(response.status, 200, 'GitHub run lookup failed');
  return response.json();
}
const run = await api(`actions/runs/${id}`);
assert.equal(run.repository.full_name, policy.repository);
assert.equal(run.head_repository.full_name, policy.repository);
assert.equal(run.path, '.github/workflows/prepare-release.yml');
assert.equal(run.event, 'workflow_dispatch');
assert.equal(run.head_branch, 'main');
assert.equal(run.head_sha, source);
assert.equal(run.status, 'completed');
assert.equal(run.conclusion, 'success');
const artifacts = await api(`actions/runs/${id}/artifacts`);
const candidates = artifacts.artifacts.filter(a => a.name === `aqualy-ui-candidate-${source}`);
assert.equal(candidates.length, 1);
assert.equal(candidates[0].expired, false);
console.log('PASS protected-main preparation run and retained candidate artifact');
