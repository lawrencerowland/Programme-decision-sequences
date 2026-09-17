'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const scripts=text=>[...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
const provenance=JSON.parse(read('docs/decision-migration-provenance.json'));
const catalogue=read('experiments.html');
const catalogueRoutes=[...catalogue.matchAll(/<a data-experiment href="([^"]+)"/g)].map(match=>match[1]);
assert.equal(catalogueRoutes.length,8,'all eight experiments have ordinary catalogue links');
assert.equal(new Set(catalogueRoutes).size,8,'each experiment has its own route');
const indexFile=route=>route.endsWith('/')?`${route}index.html`:route;
for(const route of catalogueRoutes)assert.ok(fs.existsSync(path.join(root,indexFile(route))),route);
for(const landing of ['index.html','evidence.html'])assert.match(read(landing),/href="experiments\.html"/,'existing landing links to full catalogue');
for(const app of provenance.apps){
  const dest=indexFile(app.destination),html=read(dest);
  assert.ok(catalogueRoutes.includes(app.destination.replace(/index\.html$/,'')),`catalogued: ${dest}`);
  assert.match(html,/href="\.\.\/\.\.\/experiments\.html"/,'app has a relative return link');
  if(app.kind==='static'){
    assert.equal(scripts(html).length,app.script_count,dest);
    assert.equal(hash(JSON.stringify(scripts(html))),app.scripts_sha256,`all repaired scripts preserved: ${dest}`);
  }else for(const [file,sha] of Object.entries(app.preserved_files))assert.equal(hash(fs.readFileSync(path.join(root,app.maintained_source,file))),sha,`React app/model/test preserved: ${file}`);
}
for(const [file,sha] of Object.entries(provenance.existing_model_scripts))assert.equal(hash(file.endsWith('.html')?JSON.stringify(scripts(read(file))):read(file)),sha,`existing model unchanged: ${file}`);
// Parse actual markup only: embedded Plotly JavaScript contains HTML-like strings
// that are not page asset requests or navigation links.
for(const route of ['experiments.html',...catalogueRoutes]){
 const name=indexFile(route),html=read(name).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>tag.slice(0,tag.indexOf('>')+1)+'<\/script>');
 for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)){
  const ref=match[1];if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;
  const target=decodeURIComponent(ref.split(/[?#]/)[0]);if(!target)continue;
  assert.ok(!target.startsWith('/'),'assets are subpath-safe: '+ref);
  const resolved=path.resolve(root,path.dirname(name),target);
  assert.ok(resolved.startsWith(root+path.sep)||resolved===root,'link stays in repository: '+ref);
  assert.ok(fs.existsSync(resolved),`${name} -> ${ref}`);
  if(fs.statSync(resolved).isDirectory())assert.ok(fs.existsSync(path.join(resolved,'index.html')),ref);
 }
}
assert.match(read('apps/climate-sdam-report/index.html'),/href="\.\.\/climate-policy-simulator\/"/,'historical report points to current companion');
assert.match(read('apps/climate-policy-simulator/index.html'),/href="\.\.\/\.\.\/docs\/decision-repairs-method\.md"/,'model method is reachable');
console.log('Migration checks passed: eight catalogue entries, six return routes, local links/assets, preserved imported functionality and unchanged existing models.');
