// import { Redis } from "@upstash/redis/cloudflare";

import { drizzle } from "drizzle-orm/d1";
import { workflows } from "./db/schema";
import {
  COMS_CHANNEL,
  DECISION,
  INITIATOR_TYPE,
  WorkflowContext,
} from "../const/WorkflowContext";
import { Client } from "@upstash/qstash";

type ClientDetails = {
  name: string;
  amount: number;
  reason: string;
};

export const startWorkflow = async (
  D1: D1Database,
  clientDetails: ClientDetails
) => {
  const db = drizzle(D1);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 2);

  const workflow: WorkflowContext = {
    metadata: {
      workflowType: "EXPENSE_APPROVAL",
      initiator: {
        type: INITIATOR_TYPE.AI_AGENT,
        agentId: "accountant_bot_v1",
      },
    },
    payload: {
      uiSchema: {
        title: "Expense Report Approval",
        type: "object",
        properties: {
          employeeName: { type: "string", title: "Employee", readOnly: true },
          amount: { type: "number", title: "Amount (INR)", readOnly: true },
          reason: { type: "string", title: "Reason", readOnly: true },
          decision: {
            type: "string",
            title: "Your Decision",
            enum: ["APPROVE", "DENY"],
          },
          manager_notes: {
            type: "string",
            title: "Notes (Required if Denied)",
            "ui:widget": "textarea",
          },
        },
        required: ["decision"],
      },
      uiData: {
        employeeName: clientDetails.name,
        amount: clientDetails.amount,
        reason: clientDetails.reason,
      },
    },
    humanInteraction: {
      recipient: { userId: "manager_ravi", channel: COMS_CHANNEL.WEB_PORTAL },
      deadline: deadline.toISOString(),
      response: {
        comments: null,
        decision: DECISION.PENDING,
        submittedAt: null,
      },
    },
    eventLog: [
      // {
      //   eventType: "HUMAN_INTERACTION_REQUESTED",
      //   timestamp: new Date().toISOString(),
      //   state: "REQUESTED",
      //   details: {
      //     initiatedBy: "accountant_bot_v1",
      //     decision: DECISION.PENDING,
      //   },
      // },
    ],
  };
  const res = await db
    .insert(workflows)
    .values({
      currentState: "REQUESTED",
      contextData: workflow,
    })
    .returning({ workflowId: workflows.workflowId });

  // const client = new Client({ token: QSTASH_TOKEN });
  const client = new Client({
    token:
      "eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=",
    baseUrl: "http://127.0.0.1:8081",
  });
  const publishRes = await client.publishJSON({
    // url: "https://human-in-loop.gouravdeb.workers.dev/api/workflow-callback",
    url: "http://localhost:5173/api/workflows",
    body: {
      workflowId: res[0].workflowId,
      eventType: "HUMAN_INTERACTION_REQUESTED",
      state: "REQUESTED",
      initiatedBy: "accountant_bot_v1",
    },
  });
  // log res
  console.log("QStash publish res:", publishRes);
  return res[0].workflowId;
};
