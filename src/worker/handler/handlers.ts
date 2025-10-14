import { WorkflowContext } from "../../const/WorkflowContext";

const handleHumanInteractionRequested = async (workflow: WorkflowContext) => {
  // channel type for notification - WEB_PORTAL FOR NOW
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const channel = workflow.humanInteraction?.recipient.channel;

  console.log("human interaction needed done");
};

const handleActionSubmitted = async (workflow: WorkflowContext) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("human action submitted");
};

const handleInteractionTimedOut = async (workflow: WorkflowContext) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("human interaction timed out");
};

export const eventHandlers = {
  HUMAN_INTERACTION_REQUESTED: handleHumanInteractionRequested,
  HUMAN_ACTION_SUBMITTED: handleActionSubmitted,
  HUMAN_INTERACTION_TIMED_OUT: handleInteractionTimedOut,
};
