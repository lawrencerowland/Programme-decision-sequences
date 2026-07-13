# Reinforcement Learning for Projects


Background: When making predictions, Reinforcement learning takes into account the decisions and actions that are taken along the way, and then recommends a next action. Warren Powell has generalised this approach to give a framework for making sequential decisions under uncertainty which takes advantage of the adjacent communities for optimal control and linear programming 

Motivation: Even without generating a project RL model, these frameworks have the potential to structure and simplify the way that projects make decisions and deal with uncertainty. This is crucial for projects because the actions in a schedule are normally distinct from the decisions taken by management which are themselves distinct from the attempt to identify and resolve specific uncertainties. 

Ends: 
1. Realistically simulate a specific projects as sequential decision making problem as per Powell’s framework. Do this for a specific project management problem where uncertainty is being reduced as exogenous information comes in at each time step, a decision is made, and the state changes, back round to the next new bit of info coming in, as per the sequential decision making variables Warren Powell uses. If the user gives you a project problem, do this for that problem. Otherwise use the scenario of running a a climate engineering mega project, where the scope is changed every quarter depending on the change in the global average temperature trend in the last quarter, relative to expectations. First apply Powell's framework into a tightly defined decision plan which is highly specific to the scenario. Then simulate likely paths, including likely information, and likely decisions based on that (assuming an excellent project director), using the code interpreter. then visualise that. then run multiple paths and find a way of visualising these branching paths. 
2. create a small tool that frame the decisions they regularly need to make as a reinforcement learning problem, and identifies how they should be attending to new information to reduce uncertainty. Do this by identifying what types of decisions they need to make at their management level, and what information they do not believe they have which they would like to make the decision. The tool should enable them to focus on seeking realistic levels of new information whilst keeping a decision-making cadence that matches the rate of change of their project. 

Ways:
1. Powell’s sequential decision making framework, both the main types of problem as he defines it, and the four main classs of solution, as well as the delineation of problems into a strict repeating sequence. You should consult and make the most of anything in the Programme decision seq. tag which is subset of the best tag in Portfolio wave Database in DT. 
2. Use of Powell’s code for specific case studies for different types of problem 
3. The use of Sutton and Barto’s RL techniques where appropriate , where it fits better than Powell’s work

Means:
1. present everything as one big visual interactive html
2. you may also use as inspiration code from Warren Powell's python implementation of his case studies in case any of these case studies are close enough to the project use case https://github.com/wbpowell328/stochastic-optimization

Guidance:  The tool can structure their sequential decision-making process, either in the RL paradigm of states, actions, and value / rewards (s, a, v) or in Powell’s paradigm of state, decision variable and exogenous information (s, x, W). It may be best to start with an even simpler model first (state to state, or action to action). This can be extended to include transition function and objective function where possible. If using RL, one could start with a Markov model, or if using Powell, start with the case study method in Powell  which comes with Modelling exercises in python).

