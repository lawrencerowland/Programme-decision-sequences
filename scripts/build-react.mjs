import { build } from 'vite';
import { readdir,readFile,writeFile,mkdir,cp,rm } from 'node:fs/promises';
import { resolve,dirname,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const check=process.argv.includes('--check');
await build({configFile:resolve(root,'vite.react.config.mjs')});
const parts=['assets','weekly-it-project-game','it-decision-tutorial'];
async function files(folder){const found=[];for(const entry of await readdir(folder,{withFileTypes:true})){const p=resolve(folder,entry.name);if(entry.isDirectory())found.push(...await files(p));else found.push(p);}return found.sort();}
const buildRoot=resolve(root,'.react-build'),manifest={};
for(const part of parts)for(const src of await files(resolve(buildRoot,part))){const name=relative(buildRoot,src),bytes=await readFile(src);manifest[name]=createHash('sha256').update(bytes).digest('hex');}
if(check){
  const committed=JSON.parse(await readFile(resolve(root,'docs/decision-react-build.json'),'utf8'));
  if(JSON.stringify(committed)!==JSON.stringify(manifest))throw Error('Generated route manifest differs. Run npm run build and include its outputs.');
  for(const [name,hash] of Object.entries(manifest)){const actual=createHash('sha256').update(await readFile(resolve(root,'apps',name))).digest('hex');if(actual!==hash)throw Error(`Generated route differs: ${name}`);}
  console.log(`Verified ${Object.keys(manifest).length} generated files against maintained React sources.`);
}else{
  // Replace only these generated directories; four maintained HTML companions
  // elsewhere under apps/ are never touched by the React build.
  for(const part of parts){const dest=resolve(root,'apps',part);await rm(dest,{recursive:true,force:true});await mkdir(dirname(dest),{recursive:true});await cp(resolve(buildRoot,part),dest,{recursive:true});}
  await writeFile(resolve(root,'docs/decision-react-build.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Updated ${Object.keys(manifest).length} generated files for the two maintained React routes.`);
}
