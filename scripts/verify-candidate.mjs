import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { policy, verifyReceipt, assertPublishAuthorized } from './release-artifact.mjs';

const directory = process.env.AQUALY_ARTIFACT_DIRECTORY;
assert.ok(directory, 'AQUALY_ARTIFACT_DIRECTORY is required');
const source = process.env.AQUALY_RELEASE_SOURCE;
const sha = process.env.AQUALY_RELEASE_SHA256;
if (process.argv.includes('--authorized')) assertPublishAuthorized(source, sha);
await verifyReceipt(resolve(directory, 'release-receipt.json'), source, sha);
console.log(`PASS exact ${policy.packageName}@${policy.version} artifact; registry unchanged`);
