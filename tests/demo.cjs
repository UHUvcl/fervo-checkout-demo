const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module,exports:module.exports,require:()=>load('lib/products.ts')});return module.exports;}
const pricing=load('lib/pricing.ts');
for(const [q,total] of [[1,10],[3,27],[4,37],[6,54]])assert.equal(pricing.calculateCartTotal(pricing.normalizeCart({'mate-limao':q})).total,total);
assert.equal(pricing.normalizeCart({unknown:1}).length,0);
for(const file of ['app/page.tsx','app/gestor/gestor-client.tsx'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/fetch\(|wa\.me|\/api\//);
assert.equal(fs.existsSync('app/api'),false);
console.log('8 verificacoes aprovadas');
