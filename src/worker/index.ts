import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { workflows } from "./db/schema";
import { Client } from "@upstash/qstash";
import {
  COMS_CHANNEL,
  INITIATOR_TYPE,
  WorkflowContext,
} from "../const/WorkflowContext";
import { startWorkflow } from "./workflows";
import { eq } from "drizzle-orm";
import { eventHandlers } from "./handler/handlers";
import { promptHandler, responseSchema } from "./promptHandler";

export interface Env {
  QSTASH_URL: string;
  QSTASH_TOKEN: string;
  MAIL_TOKEN: string;
  AI_TOKEN: string;
  DB: D1Database;
  Ai: Ai;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health-check", async (c) => {
  const db = drizzle(c.env.DB);
  const res = await db.select().from(workflows).all();
  return c.json({ name: "Cloudflare", res });
});

app.get("/api/workflows", async (c) => {
  const db = drizzle(c.env.DB);
  const res = await db.select().from(workflows).all();
  return c.json({ workflows: res });
});

app.post("/api/bot", async (c) => {
  const body = await c.req.json();
  console.log("rcvd msg");

  let userMessage: string;
  let conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  try {
    userMessage = body.message;
    conversationHistory = body.conversationHistory || [];
  } catch (error) {
    userMessage = body;
  }

  const unifiedPrompt = promptHandler(userMessage, conversationHistory);

  const aiResponse = await c.env.Ai.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      prompt: unifiedPrompt,
      response_format: { type: "json_schema", json_schema: responseSchema },
    }
  );

  //@ts-ignore
  const result = aiResponse?.response as any;
  console.log("result", result);
  // Handle the simplified response structure
  if (
    result.status === "complete" &&
    result.name &&
    result.amount &&
    result.reason
  ) {
    // SUCCESS CASE: We have all the data
    const { name, amount, reason } = result;
    const workflowResponse = await startWorkflow(c.env.DB, {
      name,
      amount,
      reason,
    });

    return c.json({
      message: `I've started the expense approval workflow for ${name}. 
      Amount: $${amount} for ${reason}. Your workflow ID is ${workflowResponse}.`,
    });
  } else {
    // FALLBACK CASE: Use AI's reply or default message
    return c.json({
      message:
        result.replyMessage ||
        "I'm sorry, I'm having trouble understanding. Could you please provide the name, amount, and reason for your expense?",
    });
  }
});

// updates db with new state and context data
// calls event handler
// advances workflow to next state
app.post("/api/workflows", async (c) => {
  const message = await c.req.json();
  console.log("Received request to start workflow", message);
  // return;
  const { eventType, workflowId, state, initiatedBy, decision } = message;
  const db = drizzle(c.env.DB);
  // const handler
  const workflow = await db
    .select()
    .from(workflows)
    .where(eq(workflows.workflowId, workflowId));
  if (!workflow || workflow.length === 0) {
    return c.json({ message: "Workflow not found", status: "error" }, 404);
  }
  const existingContext = workflow[0].contextData as WorkflowContext;

  const updatedContext: WorkflowContext = {
    ...existingContext,
    humanInteraction: {
      ...existingContext.humanInteraction,
      response: {
        ...existingContext.humanInteraction?.response,
        decision:
          decision || existingContext.humanInteraction?.response.decision,
      },
    },
    eventLog: [
      ...(existingContext.eventLog || []),
      {
        eventType,
        state,
        timestamp: new Date().toISOString(),
        details: {
          initiatedBy,
          decision:
            decision || existingContext.humanInteraction?.response.decision,
        },
      },
    ],
  };
  await db
    .update(workflows)
    .set({
      currentState: state,
      contextData: updatedContext,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(workflows.workflowId, workflowId));

  if (!workflow || workflow.length === 0) {
    return c.json({ message: "Workflow not found", status: "error" }, 404);
  }
  console.log("expense process");
  // event handler
  const handler = eventHandlers[eventType as keyof typeof eventHandlers];
  if (!handler) {
    console.log("No handler for event type", eventType);
    return c.json(
      { message: "No handler for event type", status: "error" },
      300
    );
  }
  await handler(workflow[0].contextData as WorkflowContext, c.env);

  return c.json({ message: "Workflow started", status: "success" });
});

app.post("/api/workflow-approved", async (c) => {
  const body = await c.req.json();
  const client = new Client({
    token:
      "eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=",
    baseUrl: "http://127.0.0.1:8081",
  });
  const publishRes = await client.publishJSON({
    // url: "https://human-in-loop.gouravdeb.workers.dev/api/workflow-callback",
    url: "http://localhost:5173/api/workflows",
    body,
  });
  // log res
  console.log("QStash publish res:", publishRes);

  return c.json({ message: "Workflow approved", status: "success" });
});

export default app;
