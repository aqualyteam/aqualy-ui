import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=process.argv[2]?resolve(process.argv[2]):fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await readFile(resolve(root,'public-source-manifest.json'),'utf8'));
assert.equal(manifest.totalExports,66);
const paths=new Set();
const forbiddenText=[['','Users',''].join('/'),['','private','tmp',''].join('/'),['','.codex',''].join('/'),['aqualy','design','playground'].join('-'),'M633'+'.788760',['viewBox=','"0 0 770',' 770"'].join('')];
const signatures=[/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/,/(?:sk|rk)_live_[A-Za-z0-9]{20,}/,/AKIA[0-9A-Z]{16}/];
for(const row of manifest.files){
 assert.ok(!paths.has(row.path));paths.add(row.path);
 assert.ok(!row.path.startsWith('/')&&!row.path.split('/').includes('..'));
 const bytes=await readFile(resolve(root,row.path));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,row.path);
 if(!row.path.endsWith('.woff2')){
  const text=bytes.toString('utf8');
  for(const fragment of forbiddenText)assert.ok(!text.includes(fragment),`${row.path}: private path/artwork signature`);
  for(const signature of signatures)assert.ok(!signature.test(text),`${row.path}: credential signature (contents redacted)`);
 }
}
for(const prefix of ['apps/brand','docs/migration','docs/decisions','tests/brand','tests/fixtures/next-consumer'])assert.ok(![...paths].some(p=>p.startsWith(prefix)),prefix);
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).filter(e=>!['node_modules','.git','.store','dist'].includes(e.name)).map(e=>e.isDirectory()?walk(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
for(const file of await walk(root)){const path=relative(root,file);if(path==='public-source-manifest.json'||path.endsWith('.tsbuildinfo'))continue;assert.ok(paths.has(path),`Unlisted public file: ${path}`);}
const pkg=JSON.parse(await readFile(resolve(root,'packages/aqualy-ui/package.json'),'utf8'));
assert.equal(Object.keys(pkg.exports).length,66);assert.equal(pkg.license,'MIT');assert.equal(pkg.publishConfig.access,'public');
assert.ok(paths.has('LICENSE')&&paths.has('packages/aqualy-ui/LICENSE'));
console.log(`PASS public source: ${paths.size} hashed files; MIT package, no private paths/history/artwork or matched credential signatures`);
