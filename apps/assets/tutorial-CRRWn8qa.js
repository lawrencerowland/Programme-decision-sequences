import{r as h,j as e,R as g,a as f}from"./index-pbexmW8_.js";function y(){const[t,o]=h.useState(0),i={scenario:"You are managing a software development project with a team of 5 developers. The project needs to be completed in 12 weeks, and you have a budget of $100,000. Each week, you need to decide how to allocate resources and prioritize tasks.",steps:[{title:"Step 1: Narrative",description:"The narrative is a plain English description of the sequential decision problem.",content:`In this project management scenario, you face a series of decisions each week:

1. How to allocate your team's time across different tasks
2. How to prioritize tasks based on their importance and deadlines
3. How to manage the budget, including decisions on overtime or additional resources

Each decision affects the project's progress, budget, and team morale, influencing future decisions. The goal is to complete the project on time and within budget while maintaining high quality and team satisfaction.`},{title:"Step 2: Core Elements",description:"The core elements include metrics to optimize, decisions to be made, and sources of uncertainty.",content:`Metrics (what we're trying to optimize):
1. Project completion percentage
2. Budget utilization
3. Team productivity
4. Code quality
5. Client satisfaction

Decisions:
1. Task prioritization
2. Resource allocation
3. Overtime authorization
4. Budget allocation

Uncertainties:
1. Task complexity and duration
2. Team performance variability
3. Client requirement changes
4. Technical challenges
5. Team member availability (e.g., sick days)`},{title:"Step 3: Mathematical Model",description:"A proposed mathematical model has five elements. This page explains them; it does not execute the model.",content:`State Variables (S_t) - Information needed to make decisions:
1. Completed tasks (percentage)
2. Remaining budget
3. Team utilization
4. Current sprint backlog
5. Project timeline (weeks elapsed)

Decision Variables (x_t) - Choices made at each decision point:
1. Hours allocated to each task
2. Budget allocated to each task
3. Overtime hours authorized

Exogenous Information (W_t+1) - New information after decisions are made:
1. Actual task completion times
2. New feature requests
3. Bugs discovered
4. Team member absences

Transition Function (S_t+1 = S^M(S_t, x_t, W_t+1)) - How the state evolves:
• Update completed tasks based on work done and actual completion times
• Adjust remaining budget based on expenditures
• Update team utilization based on allocated hours and absences
• Modify sprint backlog with completed tasks and new requests

Candidate objective (max_π E{Σ_t C(S_t, X^π(S_t))|S_0}) - Define a contribution C and explicit weights or constraints before comparing these goals:
• Maximize project completion percentage
• Minimize budget overruns
• Maximize team productivity
• Maximize code quality
• Maximize client satisfaction`},{title:"Step 4: Uncertainty Model",description:"These invented uncertainty distributions illustrate how one might represent unknowns. No distributions are sampled on this tutorial page.",content:`1. Task Duration Uncertainty:
   • Use historical data to create probability distributions for task completion times
   • Example: Task A ~ Normal(μ=3 days, σ=0.5 days)

2. Team Performance Variability:
   • Model individual developer productivity as a random variable
   • Example: Developer X productivity ~ Uniform(0.8, 1.2) * average productivity

3. Client Requirement Changes:
   • Model as a Poisson process for the arrival of new features
   • Example: New features arrive at rate λ = 0.5 per week

4. Technical Challenges:
   • Use a discrete probability distribution for different levels of technical difficulty
   • Example: P(Easy) = 0.6, P(Medium) = 0.3, P(Hard) = 0.1

5. Team Member Availability:
   • Model sick days as a Bernoulli process for each team member
   • Example: P(team member available) = 0.95 each day`},{title:"Step 5: Designing Policies",description:"Policies map the information currently available to an action. These examples are proposals, not implemented algorithms or the four formal policy classes.",content:`1. Task Prioritization Policy:
   • Use a scoring system based on task urgency, importance, and estimated time
   • Score = (Urgency * 0.4) + (Importance * 0.4) + (1 / Estimated Time * 0.2)
   • Prioritize tasks with the highest scores

2. Resource Allocation Policy:
   • Allocate developers to tasks based on their skills and the task requirements
   • A later implementation could test a matching algorithm, with declared skill and capacity constraints

3. Overtime Authorization Policy:
   • IF (project completion percentage < expected completion percentage) AND (remaining budget > 10% of total budget)
     THEN authorize overtime up to 20% of regular hours
   • ELSE no overtime authorized

4. Budget Allocation Policy:
   • Allocate budget to tasks proportionally to their estimated time and complexity
   • Set aside 20% of the budget for unforeseen issues

5. Risk Mitigation Policy:
   • IF (risk level > threshold) THEN allocate additional resources to high-risk tasks
   • Continuously update risk assessments based on new information`},{title:"Step 6: Policy Evaluation",description:"A proposed evaluation plan for a future implementation. This page runs no Monte Carlo trials, sensitivity analysis, calibration or machine learning.",content:`1. Simulation:
   • Create a Monte Carlo simulation of the project using the uncertainty model
   • Run the simulation multiple times with different policies
   • Collect statistics on project outcomes (completion time, budget usage, quality metrics)

2. Sensitivity Analysis:
   • Vary key parameters (e.g., team size, budget, project duration) to test policy robustness
   • Identify which factors have the most significant impact on project success

3. Comparative Analysis:
   • Compare the performance of different policies across various metrics
   • Use visualization tools (e.g., bar charts, radar charts) to illustrate policy trade-offs

4. Historical Data Validation:
   • Test policies against data from past projects to assess their effectiveness
   • Calibrate model parameters based on historical performance

5. Iterative Improvement:
   • Use machine learning techniques to refine policies based on simulation results
   • Validate and review promising policies before any real-project use
   • Continuously update and improve policies based on new data and insights`}]},s=()=>{t<i.steps.length-1&&o(t+1)},r=()=>{t>0&&o(t-1)},l={maxWidth:"800px",margin:"0 auto",padding:"20px",fontFamily:"Arial, sans-serif",lineHeight:"1.6"},c={fontSize:"24px",marginBottom:"20px",color:"#333"},d={backgroundColor:"#f0f0f0",padding:"15px",borderRadius:"5px",marginBottom:"20px",border:"1px solid #ddd"},p={fontSize:"20px",marginBottom:"10px",color:"#2c3e50"},m={marginBottom:"10px",fontStyle:"italic",color:"#555"},u={backgroundColor:"#e6f3ff",padding:"15px",borderRadius:"5px",marginBottom:"20px",border:"1px solid #b8daff",whiteSpace:"pre-wrap"},n={padding:"10px 20px",marginRight:"10px",backgroundColor:"#007bff",color:"white",border:"none",borderRadius:"5px",cursor:"pointer"},a={...n,backgroundColor:"#cccccc",cursor:"not-allowed"};return e.jsxs("div",{style:l,children:[e.jsx("h1",{style:c,children:"Project Management Sequential Decision Breakdown"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Six-step tutorial."})," Use Next and Previous to explore a worked IT example. All numbers are illustrative; this page explains a modelling workflow and does not run a simulation, optimise a policy or validate a project plan."]}),e.jsx("p",{children:"Choose using information in S_t; new information W_t+1 arrives after the choice and updates S_t+1."}),e.jsxs("p",{role:"status",children:["Step ",t+1," of ",i.steps.length]}),e.jsxs("div",{style:d,children:[e.jsx("h3",{children:"Scenario:"}),e.jsx("p",{children:i.scenario})]}),e.jsxs("div",{children:[e.jsx("h2",{style:p,children:i.steps[t].title}),e.jsx("p",{style:m,children:i.steps[t].description}),e.jsx("div",{style:u,children:e.jsx("p",{children:i.steps[t].content})})]}),e.jsxs("div",{children:[e.jsx("button",{onClick:r,disabled:t===0,style:t===0?a:n,children:"Previous"}),e.jsx("button",{onClick:s,disabled:t===i.steps.length-1,style:t===i.steps.length-1?a:n,children:"Next"})]})]})}const b=g.createRoot(document.getElementById("root"));b.render(e.jsx(f.StrictMode,{children:e.jsx(y,{})}));
