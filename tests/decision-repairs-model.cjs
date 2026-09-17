'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const routes={"Project_Decision_Framing_Tool.html": "apps/project-framing/index.html", "climate-sequential-decision-paths.html": "apps/climate-decision-paths/index.html", "climate_megaproject_sdam.html": "apps/climate-sdam-report/index.html", "Sequential decisions.html": "apps/climate-policy-simulator/index.html"};
const read=name=>fs.readFileSync(path.join(root,routes[name]),'utf8');
const html=read('Sequential decisions.html');
const sandbox={};vm.createContext(sandbox);vm.runInContext(html.match(/<script id="decision-model">([\s\S]*?)<\/script>/)[1],sandbox);
const m=sandbox.DecisionModel,plain=x=>JSON.parse(JSON.stringify(x));let checks=0;
function check(name,f){f();checks++;console.log('PASS',name);}
const near=(a,b,eps=1e-11)=>assert.ok(Math.abs(a-b)<=eps,`${a} != ${b}`);
check('all four app scripts parse without a browser',()=>{
  for(const f of ['Sequential decisions.html','climate_megaproject_sdam.html','climate-sequential-decision-paths.html','Project_Decision_Framing_Tool.html'])for(const s of read(f).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(s[1],{filename:f});
});
check('strict finite/integer/range controls, including blank and Infinity',()=>{
  for(const [key,values] of Object.entries({horizon:[0,7,61,8.5,NaN,Infinity,'40'],runs:[0,61,8.1],seed:[-1,0.2,4294967296],target:[1,3,NaN],trueK:[0,.1],priorMean:[0,.1],budget0:[0,201]}))for(const value of values)assert.throws(()=>m.validateControls({[key]:value}),undefined,`${key}=${value}`);
  assert.equal(m.validateControls({seed:0}).seed,0);
});
check('seeded results repeat exactly; different seeds change realised paths',()=>{
  assert.deepEqual(plain(m.simulate('DLA')),plain(m.simulate('DLA')));
  assert.notDeepEqual(plain(m.simulate('DLA',{seed:8})),plain(m.simulate('DLA',{seed:7})));
});
check('fixed hidden effectiveness remains fixed while posterior learns',()=>{
  for(const policy of m.POLICIES){const run=m.simulate(policy);assert.ok(run.path.every(row=>row.true_k===m.DEFAULTS.trueK));assert.equal(run.meta.true_k,m.DEFAULTS.trueK);assert.ok(run.path.some(row=>Math.abs(row.mu_k_next-m.DEFAULTS.priorMean)>1e-8));}
});
check('all policies ignore hidden truth at the current choice',()=>{
  const c=m.validateControls(),s=m.initialState(c);
  for(const policy of m.POLICIES){assert.deepEqual(plain(m.policyAction(policy,s,{target:c.target,trueK:.001},40)),plain(m.policyAction(policy,s,{target:c.target,trueK:.06},40)));const a=m.simulate(policy,{trueK:.001}).path[0],b=m.simulate(policy,{trueK:.06}).path[0];assert.deepEqual([a.du,a.m,a.e],[b.du,b.m,b.e]);assert.notEqual(a.true_temp_next,b.true_temp_next);}
});
check('changing future shocks cannot change past decisions or states',()=>{
  for(const policy of m.POLICIES){const c=m.validateControls({horizon:12}),shocks=plain(m.makeShocks(c.seed,c.horizon)),later=plain(shocks);for(let i=5;i<12;i++)later[i]={governance:2,process:3,measurement:-4,cost:5};const a=m.simulate(policy,c,shocks),b=m.simulate(policy,c,later);assert.deepEqual(plain(a.path.slice(0,5)),plain(b.path.slice(0,5)));assert.deepEqual([a.path[5].du,a.path[5].m,a.path[5].e],[b.path[5].du,b.path[5].m,b.path[5].e]);assert.notEqual(a.path[5].obs,b.path[5].obs);}
});
check('Gaussian posterior agrees with independent precision-form calculation',()=>{
  const s={mu:.01,variance:.003**2};
  const x=.7,obs=.004,R=m.FIXED.processSD**2+m.MONITOR.med.sd**2,precision=1/s.variance+x*x/R;
  const expectedMean=(s.mu/s.variance+x*(m.FIXED.baseTrend-obs)/R)/precision;
  const p=m.posterior(s,x,obs,'med');near(p.mu,expectedMean);near(p.variance,1/precision);
});
check('zero exposure gives no learning; better monitoring lowers posterior variance',()=>{
  const s={mu:.01,variance:.003**2};assert.deepEqual(plain(m.posterior(s,0,10,'high')),s);
  const low=m.posterior(s,.7,0,'low'),high=m.posterior(s,.7,0,'high');assert.ok(high.variance<low.variance);assert.ok(high.mu>s.mu,'cooler than expected implies greater effectiveness');
});
check('world update uses fixed truth, not mutable belief; budget and cost obey the same recorded action',()=>{
  const c=m.validateControls(),s=m.initialState(c),a={du:.05,m:'high',e:'med'},w={k:.018,temp:1.3},z={governance:0,process:0,measurement:0,cost:0};
  const one=m.realisedStep(s,w,a,z,c),two=m.realisedStep({...s,mu:.03},w,a,z,c);
  near(one.world.temp,two.world.temp);assert.notEqual(one.pred,two.pred);
  const ready=.9*s.ready+.05,exposure=.25*(.45+.75*ready),spend=.45+2.4*.25+.22+.1;
  near(one.world.temp,w.temp+m.FIXED.baseTrend-w.k*exposure);near(one.next.budget,c.budget0-spend);near(one.spend,spend);
});
check('optimising representatives actually minimise their declared candidate objective',()=>{
  const c=m.validateControls(),base=m.initialState(c),states=[base,{...base,temp:1.53,ready:.3,scope:.8,budget:20},{...base,temp:1.4,scope:0,budget:1}];
  for(const s of states)for(const policy of ['CFA','VFA','DLA','HYBRID']){const chosen=m.policyAction(policy,s,c,12);const values=m.candidateActions(s).map(a=>m.scoreAction(policy,s,a,c,12));near(m.scoreAction(policy,s,chosen,c,12),Math.min(...values));}
});
check('CFA VFA DLA and hybrid have distinct action-scoring mechanisms',()=>{
  const c=m.validateControls(),s={...m.initialState(c),temp:1.55,scope:.5},a={du:.05,m:'high',e:'med'};
  const scores=['CFA','VFA','DLA','HYBRID'].map(p=>m.scoreAction(p,s,a,c,20));assert.equal(new Set(scores.map(x=>x.toFixed(8))).size,4);
});
check('paths remain finite and scope/readiness/ramp/uncertainty bounds hold at control extremes',()=>{
  for(const controls of [{},{horizon:60,seed:0,target:1.2,trueK:.06,priorMean:.001,budget0:1},{horizon:8,seed:4294967295,target:2.5,trueK:.001,priorMean:.06,budget0:200}])for(const p of m.POLICIES){const run=m.simulate(p,controls);for(const row of run.path){for(const value of Object.values(row))if(typeof value==='number')assert.ok(Number.isFinite(value));assert.ok(row.scope_next>=0&&row.scope_next<=1);assert.ok(row.readiness_next>=0&&row.readiness_next<=1);assert.ok(Math.abs(row.du)<=.05+1e-12);assert.ok(row.sigma_k_next>=0&&row.sigma_k_next<=m.FIXED.priorSD+1e-12);}}
});
check('even-sample median averages both central observations; quantiles interpolate',()=>{
  near(m.quantile([4,1,3,2],.5),2.5);near(m.quantile([0,10],.1),1);near(m.quantile([3],.9),3);near(m.quantile([1,2,3],.5),2);
});
check('benchmark comes from matching batch seeds and simulated costs, never static summaries',()=>{
  const c=m.validateControls({horizon:8,runs:8,seed:4294967294}),b=m.benchmark(c);
  for(const p of m.POLICIES){const costs=Array.from({length:8},(_,i)=>m.simulate(p,{...c,seed:(c.seed+i)>>>0}).meta.disc_cost);const mean=costs.reduce((a,b)=>a+b,0)/8;near(b[p].meanCost,mean);near(b[p].sdCost,Math.sqrt(costs.reduce((a,x)=>a+(x-mean)**2,0)/8));}
  assert.doesNotMatch(html,/INIT\.summaries|meanCost:95\.7/);
});
check('every benchmark assumption changes computed results',()=>{
  const c={horizon:8,runs:8},baseline=plain(m.benchmark(c));
  for(const diff of [{seed:9},{horizon:9},{runs:9},{target:1.7},{trueK:.03},{priorMean:.02},{budget0:10}])assert.notDeepEqual(plain(m.benchmark({...c,...diff})),baseline,JSON.stringify(diff));
});
check('historical snapshot retains every original Plotly chart payload',()=>{
  const now=read('climate_megaproject_sdam.html');
  // SHA-256 of JSON.stringify(original Plotly.newPlot script array), baseline0a84006. No git history required.
  const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(code=>code.includes('Plotly.newPlot('));assert.equal(crypto.createHash('sha256').update(JSON.stringify(scripts(now))).digest('hex'),'fceed59bef9f547ea27bf80f58e1d14e48d2666386af309596d0d0c64e7db99b');assert.match(now,/Historical, precomputed report/);assert.doesNotMatch(now,/excellent director/i);
});
check('historical framing sample uses real newlines and produces one array entry per item',()=>{
  const s=read('climate_megaproject_sdam.html'),nodes={};for(const id of [...s.matchAll(/id="([^"]+)"/g)].map(m=>m[1]))nodes[id]={value:'',innerHTML:''};
  const context={document:{getElementById:id=>nodes[id]}};context.window=context;vm.createContext(context);
  const code=[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).at(-1);vm.runInContext(code,context);context.loadExample();
  for(const id of ['decisions','uncertainties','stateR','stateI','stateB']){assert.ok(nodes[id].value.includes('\n'));assert.ok(!nodes[id].value.includes('\\n'));}
  const decode=t=>t.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  const output=()=>JSON.parse(decode(nodes.tool_out.innerHTML.match(/<pre>([\s\S]*?)<\/pre>/)[1]));
  const frame=output();assert.deepEqual(frame['Decision x_t'],plain(context.PREFILL.decisions));assert.deepEqual(frame['State S_t']['Physical R_t'],plain(context.PREFILL.state_candidates.physical_R));assert.deepEqual(frame['State S_t']['Information I_t'],plain(context.PREFILL.state_candidates.information_I));assert.deepEqual(frame['State S_t']['Belief B_t'],plain(context.PREFILL.state_candidates.belief_B));assert.deepEqual(frame['Exogenous information W_{t+1}'],plain(context.PREFILL.uncertainties));
  nodes.decisions.value=' First choice\r\n\r\n Second choice ';context.build();assert.deepEqual(output()['Decision x_t'],['First choice','Second choice']);
});
check('two-path explainer has public source links and no private citation debris',()=>{
  const s=read('climate-sequential-decision-paths.html');assert.doesNotMatch(s,/file-service:|oai_citation|latest canvas instructions|SRM360/);for(const url of ['https://warrenpowell.org/universal-modeling-framework/','https://warrenpowell.org/statevariables/','https://data.giss.nasa.gov/gistemp/','https://www.metoffice.gov.uk/hadobs/hadcrut5/'])assert.ok(s.includes(url));assert.match(s,/id="public-sources"/);
});
check('framing summary preserves submitted transition text using textContent',()=>{
  const s=read('Project_Decision_Framing_Tool.html'),nodes={};for(const id of [...s.matchAll(/id="([^"]+)"/g)].map(m=>m[1]))nodes[id]={value:'',textContent:'',style:{}};nodes.transition.value='Next = current + action\nUpdate belief from observation';
  const context={document:{getElementById:id=>nodes[id]}};vm.createContext(context);const scripts=[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);vm.runInContext(scripts.at(-1),context);context.generateSummary();assert.equal(nodes.outTransition.textContent,'Next = current + action; Update belief from observation');assert.equal(nodes.outputSummary.style.display,'block');
});
console.log(`${checks} decision repair checks passed.`);
