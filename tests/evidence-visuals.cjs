const assert = require('node:assert/strict');
const M = require('../evidence-model.js');
const V = require('../evidence-visuals.js');
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
let checks = 0;
for (const prior of [0,.2,.5,.5625,.95,1]) for (const accuracy of [.5,.8,1])
for (const passive of [.5,.8,1]) for (const deadline of [1,2,4])
for (const latency of [1,2,5]) for (const cost of [0,4,30]) {
  const c = {...M.DEFAULTS,prior,accuracy,passive,deadline,latency,cost};
  const solution = M.solve(c), before = JSON.stringify(solution.root), s = V.policySummary(solution);
  const paths = M.policyPaths(solution.root), rows = V.waterfallRows(s);
  near(s.terminalValue-s.surveyFees-s.waitingCost,solution.root.value);
  near(s.surveyFees+s.waitingCost,paths.reduce((n,p)=>n+p.probability*p.spent,0));
  near(rows[0].value+rows[1].value+rows[2].value+rows[3].value,rows[4].value);
  near(s.gain,solution.root.value-M.bestCommit(prior).value);
  assert.equal(JSON.stringify(solution.root),before,'presentation mutated solver state');
  assert.equal(V.timingData(c).lanes[2].state,latency<=deadline?'timely':'late');
  if(solution.root.best.kind==='commit') {near(s.surveyFees,0);near(s.waitingCost,0);}
  checks++;
}
const first = V.policySummary(M.solve(M.DEFAULTS));
near(first.baseline,15);near(first.grossGain,9.5);near(first.surveyFees,4);near(first.waitingCost,3);near(first.netValue,17.5);
const repeated = V.policySummary(M.solve({...M.DEFAULTS,prior:.2,cost:0,delay:0}));
near(repeated.netValue,12.04);near(repeated.grossGain,3.04);
near(M.oneSignal(.2,.8).grossValue,0);
console.log(JSON.stringify({status:'PASS',configurations:checks,checks:['value bridge reconciles to policy','costs weighted by actual paths','timeline availability','zero cost for unpurchased evidence','presentation does not mutate solver','nonmyopic witness retained']}));
