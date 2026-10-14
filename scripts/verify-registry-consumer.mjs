import assert from 'node:assert/strict';
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectTarball, digest, root } from './release-artifact.mjs';
import { registryCandidate, validateRegistryContract, assertRegistryTags } from './registry-contract.mjs';

export async function verifyAnonymousRegistryArtifact(output) {
  const candidate = validateRegistryContract();
  assert.ok(isAbsolute(output) && !resolve(output).startsWith(root), 'Archive output must be outside source checkout');
  const fetchAnonymous = async url => {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, `Anonymous registry GET ${url}`);
    assert.equal(new URL(response.url).origin, new URL(candidate.registry).origin);
    return response;
  };
  const metadata = await (await fetchAnonymous(`${candidate.registry}@aqualy%2fui/${candidate.version}`)).json();
  assert.equal(metadata.name, candidate.packageName);
  assert.equal(metadata.version, candidate.version);
  assert.equal(metadata.license, 'MIT');
  assert.equal(metadata.dist.integrity, candidate.integrity);
  const tags = await (await fetchAnonymous(`${candidate.registry}-/package/@aqualy%2fui/dist-tags`)).json();
  assertRegistryTags(tags);
  const url = new URL(metadata.dist.tarball);
  assert.equal(url.origin, new URL(candidate.registry).origin);
  const bytes = Buffer.from(await (await fetchAnonymous(url.href)).arrayBuffer());
  assert.equal(digest(bytes), candidate.sha256);
  try { await writeFile(output, bytes, { flag: 'wx', mode: 0o444 }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.ok((await lstat(output)).isFile(), 'Existing output must be a regular file');
    assert.ok(bytes.equals(await readFile(output)), 'No archive replacement');
  }
  const archive = await inspectTarball(output);
  assert.equal(archive.sha256, candidate.sha256);
  assert.equal(archive.integrity, candidate.integrity);
  const evidence = { format: 1, mode: 'anonymous-registry', checkedAt: new Date().toISOString(), packageName: candidate.packageName, version: candidate.version, buildSource: candidate.buildSource, sha256: archive.sha256, integrity: archive.integrity, tarballUrl: url.href, files: archive.files, exports: 66, license: 'MIT', tags, acceptedException: candidate.exception, nextOnly: false, stableRelease: false, publicationAuthorization: false, publication: false, attestations: metadata.dist.attestations ?? null, provenance: 'NOT RUN_BOOTSTRAP' };
  await writeFile(`${output}.registry.json`, JSON.stringify(evidence, null, 2) + '\n');
  console.log(`PASS anonymous registry artifact ${candidate.packageName}@${candidate.version}; exact SHA/integrity/171 members; explicit first-package latest exception`);
  return { archive, evidence };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 4 && process.argv[2] === '--output' && isAbsolute(process.argv[3]), 'Use --output <absolute external archive path>');
  await verifyAnonymousRegistryArtifact(process.argv[3]);
}
