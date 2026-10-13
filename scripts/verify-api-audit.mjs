import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),pkg=resolve(root,'packages/aqualy-ui');
const config=ts.readConfigFile(resolve(pkg,'tsconfig.json'),ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,pkg),program=ts.createProgram(parsed.fileNames,parsed.options),checker=program.getTypeChecker();
const components=[],issues=[];
for(const name of (await readdir(resolve(pkg,'src/components'))).filter(n=>n.endsWith('.tsx')).sort()) {
 const path=resolve(pkg,'src/components',name),source=program.getSourceFile(path);assert.ok(source);
 const text=await readFile(path,'utf8'),imports=[],slots=new Set(),aria=new Set();
 function visit(node) {
  if(node.kind===ts.SyntaxKind.AnyKeyword)issues.push(`${name}: explicit any`);
  if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)){const id=node.moduleSpecifier.text;imports.push(id);if(/^(?:@\/|next|@prisma|better-auth|stripe)|features\//.test(id))issues.push(`${name}: forbidden domain import ${id}`);}
  if(ts.isJsxAttribute(node)){const key=node.name.getText(source);if(key.startsWith('aria-'))aria.add(key);if(key==='data-slot'&&node.initializer&&ts.isStringLiteral(node.initializer))slots.add(node.initializer.text);}
  if(ts.isCallExpression(node)&&node.expression.getText(source)==='cn')for(const arg of node.arguments)if(arg.getText(source)==='className'){const type=checker.getTypeAtLocation(arg);const choices=type.isUnion()?type.types:[type];if(choices.some(t=>t.getCallSignatures().length))issues.push(`${name}: state className passed unevaluated to cn`);}
  ts.forEachChild(node,visit);
 }
 visit(source);
 const symbol=checker.getSymbolAtLocation(source),exports=symbol?checker.getExportsOfModule(symbol).map(s=>s.name).sort():[];
 components.push({file:name,exports,imports,slots:[...slots].sort(),aria:[...aria].sort(),portalScoped:!text.includes('.Portal')||text.includes('AqualyUIPortalScope'),keyboardHandler:text.includes('onKeyDown'),nativePrimitive:imports.some(id=>id.startsWith('@base-ui/react/')||id==='react-day-picker'||id==='embla-carousel-react'||id==='recharts'||id==='@tanstack/react-table'),sharedComponents:imports.filter(id=>id.startsWith('#components/'))});
}
assert.equal(components.length,66);assert.deepEqual(issues,[]);assert.ok(components.every(c=>c.portalScoped));
const styles=[];for(const name of (await readdir(resolve(pkg,'src/styles'))).filter(n=>n.endsWith('.css'))) {const text=await readFile(resolve(pkg,'src/styles',name),'utf8');if(name!=='aqualy-ui.css')assert.doesNotMatch(text,/#(?:[0-9a-f]{3,8})\b/i,`${name}: raw colors outside foundations`);assert.doesNotMatch(text,/outline:[^;{}]*solid var\(--brand\)/,`${name}: low-contrast brand focus`);styles.push(name);}
const result={task:'DS-EXTRACT-01C0',componentModules:components.length,issues,styles,components};if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log('PASS: 66 typed component modules; domain boundary, state classes, scoped portals and semantic focus tokens.');
