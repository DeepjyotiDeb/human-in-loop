import { WorkflowContext } from "../../const/WorkflowContext";
import { sendEmail } from "./sendEmail";

const handleHumanInteractionRequested = async (
  workflow: WorkflowContext,
  env: any
) => {
  // channel type for notification - WEB_PORTAL FOR NOW
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // const channel = workflow.humanInteraction?.recipient.channel;
  console.log("human interaction needed done");
};

const handleActionSubmitted = async (workflow: WorkflowContext, env: any) => {
  console.log("human action submitted", workflow);

  try {
    // Extract data from workflow context
    const { employeeName, amount, reason } = workflow.payload.uiData as any;
    const decision = workflow.humanInteraction?.response?.decision;

    // Determine recipient email (you might want to get this from workflow context)
    const recipientEmail = employeeName; // Replace with actual recipient logic

    // parse name out of email
    const name = recipientEmail.split("@")[0];

    // Create email content based on decision
    const subject = `Expense ${decision}: ${name}`;
    const text = `Your expense request for ₹${amount} (${reason}) has been ${decision}.`;
    const html = `
      <h2>Expense Request ${decision}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Status:</strong> ${decision}</p>
    `;

    // You'll need to pass the API token - add it to your Env interface
    const apiToken = env.MAIL_TOKEN; // Add this to your environment
    // console.log("api token", apiToken);
    await sendEmail(recipientEmail, subject, text, html, apiToken);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

const handleInteractionTimedOut = async (
  workflow: WorkflowContext,
  env: any
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("human interaction timed out");
};

export const eventHandlers = {
  HUMAN_INTERACTION_REQUESTED: handleHumanInteractionRequested,
  HUMAN_ACTION_SUBMITTED: handleActionSubmitted,
  HUMAN_INTERACTION_TIMED_OUT: handleInteractionTimedOut,
};
