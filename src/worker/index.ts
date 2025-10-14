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
  DB: D1Database;
  QSTASH_URL: string;
  QSTASH_TOKEN: string;
  AI_TOKEN: string;
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
  const body = await c.req.text();

  let userMessage: string;
  let conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  try {
    const parsed = JSON.parse(body);
    userMessage = parsed.message;
    conversationHistory = parsed.conversationHistory || [];
  } catch (error) {
    userMessage = body;
  }

  const unifiedPrompt = promptHandler(userMessage, conversationHistory);

  const aiResponse = await c.env.Ai.run(
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    {
      prompt: unifiedPrompt,
      response_format: { type: "json_schema", json_schema: responseSchema },
    }
  );

  const result = aiResponse.response as any;

  // 3. Handle the structured response with simple logic
  if (result.status === "complete" && result.extractedData) {
    // SUCCESS CASE: We have all the data
    const { name, amount, reason } = result.extractedData;
    const workflowResponse = await startWorkflow(c.env.DB, c.env.QSTASH_TOKEN, {
      name,
      amount,
      reason,
    });

    return c.json({
      message: `I've started the expense approval workflow for ${name}. 
      Amount: $${amount} for ${reason}. Your workflow ID is ${workflowResponse}.`,
    });
  } else {
    // FALLBACK CASE: AI generated a reply for us
    return c.json({
      message:
        result.replyMessage ||
        "I'm sorry, I'm having trouble understanding. Could you please provide the name, amount, and reason for your expense?",
    });
  }
});

app.post("/api/workflows", async (c) => {
  console.log("Received request to start workflow");
  const message = await c.req.json();
  const { eventType, workflowId } = message;
  const db = drizzle(c.env.DB);
  const workflow = await db
    .select()
    .from(workflows)
    .where(eq(workflows.workflowId, workflowId));
  if (!workflow || workflow.length === 0) {
    return c.json({ message: "Workflow not found", status: "error" }, 404);
  }
  // handle event
  const r = eventHandlers[eventType as keyof typeof eventHandlers];
  await r(workflow[0].contextData as WorkflowContext);
  // advance workflow to the next state

  return c.json({ message: "Workflow started", status: "success" });
});

export default app;
