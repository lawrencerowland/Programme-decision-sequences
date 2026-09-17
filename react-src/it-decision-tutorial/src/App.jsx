import React, { useState } from 'react';

function App() {
  const [step, setStep] = useState(0);

  const pmExample = {
    scenario: "You are managing a software development project with a team of 5 developers. The project needs to be completed in 12 weeks, and you have a budget of $100,000. Each week, you need to decide how to allocate resources and prioritize tasks.",
    steps: [
      {
        title: "Step 1: Narrative",
        description: "The narrative is a plain English description of the sequential decision problem.",
        content: "In this project management scenario, you face a series of decisions each week:\n\n1. How to allocate your team's time across different tasks\n2. How to prioritize tasks based on their importance and deadlines\n3. How to manage the budget, including decisions on overtime or additional resources\n\nEach decision affects the project's progress, budget, and team morale, influencing future decisions. The goal is to complete the project on time and within budget while maintaining high quality and team satisfaction."
      },
      {
        title: "Step 2: Core Elements",
        description: "The core elements include metrics to optimize, decisions to be made, and sources of uncertainty.",
        content: "Metrics (what we're trying to optimize):\n1. Project completion percentage\n2. Budget utilization\n3. Team productivity\n4. Code quality\n5. Client satisfaction\n\nDecisions:\n1. Task prioritization\n2. Resource allocation\n3. Overtime authorization\n4. Budget allocation\n\nUncertainties:\n1. Task complexity and duration\n2. Team performance variability\n3. Client requirement changes\n4. Technical challenges\n5. Team member availability (e.g., sick days)"
      },
      {
        title: "Step 3: Mathematical Model",
        description: "A proposed mathematical model has five elements. This page explains them; it does not execute the model.",
        content: "State Variables (S_t) - Information needed to make decisions:\n1. Completed tasks (percentage)\n2. Remaining budget\n3. Team utilization\n4. Current sprint backlog\n5. Project timeline (weeks elapsed)\n\nDecision Variables (x_t) - Choices made at each decision point:\n1. Hours allocated to each task\n2. Budget allocated to each task\n3. Overtime hours authorized\n\nExogenous Information (W_t+1) - New information after decisions are made:\n1. Actual task completion times\n2. New feature requests\n3. Bugs discovered\n4. Team member absences\n\nTransition Function (S_t+1 = S^M(S_t, x_t, W_t+1)) - How the state evolves:\n• Update completed tasks based on work done and actual completion times\n• Adjust remaining budget based on expenditures\n• Update team utilization based on allocated hours and absences\n• Modify sprint backlog with completed tasks and new requests\n\nCandidate objective (max_π E{Σ_t C(S_t, X^π(S_t))|S_0}) - Define a contribution C and explicit weights or constraints before comparing these goals:\n• Maximize project completion percentage\n• Minimize budget overruns\n• Maximize team productivity\n• Maximize code quality\n• Maximize client satisfaction"
      },
      {
        title: "Step 4: Uncertainty Model",
        description: "These invented uncertainty distributions illustrate how one might represent unknowns. No distributions are sampled on this tutorial page.",
        content: "1. Task Duration Uncertainty:\n   • Use historical data to create probability distributions for task completion times\n   • Example: Task A ~ Normal(μ=3 days, σ=0.5 days)\n\n2. Team Performance Variability:\n   • Model individual developer productivity as a random variable\n   • Example: Developer X productivity ~ Uniform(0.8, 1.2) * average productivity\n\n3. Client Requirement Changes:\n   • Model as a Poisson process for the arrival of new features\n   • Example: New features arrive at rate λ = 0.5 per week\n\n4. Technical Challenges:\n   • Use a discrete probability distribution for different levels of technical difficulty\n   • Example: P(Easy) = 0.6, P(Medium) = 0.3, P(Hard) = 0.1\n\n5. Team Member Availability:\n   • Model sick days as a Bernoulli process for each team member\n   • Example: P(team member available) = 0.95 each day"
      },
      {
        title: "Step 5: Designing Policies",
        description: "Policies map the information currently available to an action. These examples are proposals, not implemented algorithms or the four formal policy classes.",
        content: "1. Task Prioritization Policy:\n   • Use a scoring system based on task urgency, importance, and estimated time\n   • Score = (Urgency * 0.4) + (Importance * 0.4) + (1 / Estimated Time * 0.2)\n   • Prioritize tasks with the highest scores\n\n2. Resource Allocation Policy:\n   • Allocate developers to tasks based on their skills and the task requirements\n   • A later implementation could test a matching algorithm, with declared skill and capacity constraints\n\n3. Overtime Authorization Policy:\n   • IF (project completion percentage < expected completion percentage) AND (remaining budget > 10% of total budget)\n     THEN authorize overtime up to 20% of regular hours\n   • ELSE no overtime authorized\n\n4. Budget Allocation Policy:\n   • Allocate budget to tasks proportionally to their estimated time and complexity\n   • Set aside 20% of the budget for unforeseen issues\n\n5. Risk Mitigation Policy:\n   • IF (risk level > threshold) THEN allocate additional resources to high-risk tasks\n   • Continuously update risk assessments based on new information"
      },
      {
        title: "Step 6: Policy Evaluation",
        description: "A proposed evaluation plan for a future implementation. This page runs no Monte Carlo trials, sensitivity analysis, calibration or machine learning.",
        content: "1. Simulation:\n   • Create a Monte Carlo simulation of the project using the uncertainty model\n   • Run the simulation multiple times with different policies\n   • Collect statistics on project outcomes (completion time, budget usage, quality metrics)\n\n2. Sensitivity Analysis:\n   • Vary key parameters (e.g., team size, budget, project duration) to test policy robustness\n   • Identify which factors have the most significant impact on project success\n\n3. Comparative Analysis:\n   • Compare the performance of different policies across various metrics\n   • Use visualization tools (e.g., bar charts, radar charts) to illustrate policy trade-offs\n\n4. Historical Data Validation:\n   • Test policies against data from past projects to assess their effectiveness\n   • Calibrate model parameters based on historical performance\n\n5. Iterative Improvement:\n   • Use machine learning techniques to refine policies based on simulation results\n   • Validate and review promising policies before any real-project use\n   • Continuously update and improve policies based on new data and insights"
      }
    ]
  };

  const handleNext = () => {
    if (step < pmExample.steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
  };

  const headingStyle = {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  };

  const scenarioStyle = {
    backgroundColor: '#f0f0f0',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #ddd',
  };

  const stepTitleStyle = {
    fontSize: '20px',
    marginBottom: '10px',
    color: '#2c3e50',
  };

  const descriptionStyle = {
    marginBottom: '10px',
    fontStyle: 'italic',
    color: '#555',
  };

  const contentStyle = {
    backgroundColor: '#e6f3ff',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #b8daff',
    whiteSpace: 'pre-wrap',
  };

  const buttonStyle = {
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Project Management Sequential Decision Breakdown</h1>
      <p><strong>Six-step tutorial.</strong> Use Next and Previous to explore a worked IT example. All numbers are illustrative; this page explains a modelling workflow and does not run a simulation, optimise a policy or validate a project plan.</p>
      <p>Choose using information in S_t; new information W_t+1 arrives after the choice and updates S_t+1.</p>
      <p role="status">Step {step + 1} of {pmExample.steps.length}</p>
      <div style={scenarioStyle}>
        <h3>Scenario:</h3>
        <p>{pmExample.scenario}</p>
      </div>
      <div>
        <h2 style={stepTitleStyle}>{pmExample.steps[step].title}</h2>
        <p style={descriptionStyle}>{pmExample.steps[step].description}</p>
        <div style={contentStyle}>
          <p>{pmExample.steps[step].content}</p>
        </div>
      </div>
      <div>
        <button 
          onClick={handlePrevious} 
          disabled={step === 0} 
          style={step === 0 ? disabledButtonStyle : buttonStyle}
        >
          Previous
        </button>
        <button 
          onClick={handleNext} 
          disabled={step === pmExample.steps.length - 1} 
          style={step === pmExample.steps.length - 1 ? disabledButtonStyle : buttonStyle}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;