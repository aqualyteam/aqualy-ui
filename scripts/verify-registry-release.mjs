import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { policy, verifyReceipt, digest } from './release-artifact.mjs';

const directory = process.env.AQUALY_ARTIFACT_DIRECTORY;
assert.ok(directory);
const receipt = await verifyReceipt(resolve(directory, 'release-receipt.json'), process.env.AQUALY_RELEASE_SOURCE, process.env.AQUALY_RELEASE_SHA256);
const response = await fetch(`${policy.registry}@aqualy%2Fui/${policy.version}`);
assert.equal(response.status, 200, 'Package not published or registry unavailable; readback not verified');
const metadata = await response.json();
assert.equal(metadata.name, policy.packageName);
assert.equal(metadata.version, policy.version);
assert.equal(metadata.license, 'MIT');
assert.equal(metadata.dist.integrity, receipt.tarball.integrity);
const url = new URL(metadata.dist.tarball);
assert.equal(url.origin, new URL(policy.registry).origin, 'Registry download origin');
const download = await fetch(url);
assert.equal(download.status, 200);
const bytes = Buffer.from(await download.arrayBuffer());
assert.equal(digest(bytes), receipt.tarball.sha256, 'Registry archive SHA');
assert.equal('sha512-' + createHash('sha512').update(bytes).digest('base64'), metadata.dist.integrity);
assert.ok(bytes.equals(await readFile(resolve(directory, receipt.tarball.filename))), 'Byte-identical registry archive');
const tagResponse = await fetch(`${policy.registry}-/package/@aqualy%2fui/dist-tags`);
assert.equal(tagResponse.status, 200, 'Anonymous dist-tag endpoint');
const tags = await tagResponse.json();
assert.equal(tags[policy.tag], policy.version);
assert.ok(!('latest' in tags), 'First candidate must only be distributed under next');
const downloadedFilename = `registry-${receipt.tarball.filename}`;
try {
  await writeFile(resolve(directory, downloadedFilename), bytes, { mode: 0o444, flag: 'wx' });
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  assert.ok(bytes.equals(await readFile(resolve(directory, downloadedFilename))), 'Retained anonymous download must remain byte-identical');
}
// Attestation existence is not cryptographic verification of its signatures or subject.
const evidence = { packageName: policy.packageName, version: policy.version, tag: policy.tag, distTags: tags, verifiedAt: new Date().toISOString(), downloadedFilename, downloadUrl: url.href, sha256: receipt.tarball.sha256, integrity: metadata.dist.integrity, anonymousDownload: 'PASS', byteIdentical: true, sourceCommit: receipt.sourceCommit, attestations: metadata.dist.attestations ?? null, provenanceCryptographicVerification: 'NOT RUN' };
await writeFile(resolve(directory, 'registry-readback.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log('PASS anonymous registry archive/integrity/tag readback; provenance verification remains separate');
