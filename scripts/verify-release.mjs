import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),pkg=JSON.parse(await readFile(resolve(root,'packages/aqualy-ui/package.json'),'utf8'));
const policy=JSON.parse(await readFile(resolve(root,'config/release-policy.json'),'utf8'));
assert.equal(pkg.version,policy.version);
if(policy.publishEnabled){
 assert.equal(policy.approvedMode,'bootstrap');
 assert.equal(policy.approvedSource,'70e1789568621cbef493cd5319b4556cb5704634');
 assert.equal(policy.approvedSha256,'948552994c0dfc74e15653268872a816f2e2821adc40fcaf6687dc6a453bb48c');
 assert.equal(policy.version,'0.1.0-next.0');assert.equal(policy.tag,'next');
}else{assert.equal(policy.approvedSource,null);assert.equal(policy.approvedSha256,null);assert.equal(policy.approvedMode,null);}
assert.equal(pkg.name,'@aqualy/ui');assert.equal(pkg.license,'MIT');assert.equal(pkg.private,false);
assert.deepEqual(pkg.publishConfig,{registry:'https://registry.npmjs.org/',access:'public'});
assert.equal(Object.keys(pkg.exports).length,66);assert.deepEqual(pkg.peerDependencies,{react:'19.2.1','react-dom':'19.2.1'});
for(const [name,version] of Object.entries(pkg.dependencies))assert.match(version,/^\d+\.\d+\.\d+$/,name);
assert.ok(pkg.files.includes('LICENSE'));assert.ok(!pkg.files.includes('src'));assert.equal(pkg.scripts.prepublishOnly,'node ../../scripts/block-publication.mjs');
const license=await readFile(resolve(root,'packages/aqualy-ui/LICENSE'),'utf8');assert.match(license,/MIT License/);assert.match(license,/Copyright \(c\) 2026 Aqualy contributors/);
async function walk(dir){const rows=await readdir(dir,{withFileTypes:true});return(await Promise.all(rows.map(e=>e.isDirectory()?walk(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
for(const path of await walk(resolve(root,'packages/aqualy-ui/src'))){const s=await readFile(path,'utf8');assert.ok(!/LicenseRef-Aqualy-Brand|M633\.788760|2210,0/.test(s),`${path}: reserved artwork signature`);}
console.log(`PASS release metadata, 66 exports, exact dependencies/peers, MIT and no official artwork; publication ${policy.publishEnabled?'authorized for the exact bootstrap artifact only':'blocked'}`);
