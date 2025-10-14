import { EventType } from "./EVENT_LIST";

export enum INITIATOR_TYPE {
  AI_AGENT = "AI_AGENT",
  HUMAN = "HUMAN",
}
export enum COMS_CHANNEL {
  WEB_PORTAL = "web_portal",
  EMAIL = "email",
  SMS = "sms",
  SLACK = "slack",
}
export enum DECISION {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}

export interface WorkflowContext {
  metadata: {
    workflowType: string;
    initiator: {
      type: INITIATOR_TYPE;
      agentId: string;
    };
  };
  payload: {
    uiSchema: Record<string, unknown>;
    uiData: Record<string, unknown>;
  };
  humanInteraction: {
    recipient: {
      userId: string;
      channel: COMS_CHANNEL;
    };
    response: {
      submittedAt: string | null;
      decision: DECISION;
      comments: string | null;
    };
    deadline: string; // ISO date string
  };
  eventLog: {
    timestamp: string;
    eventType: EventType;
    details?: Record<string, unknown>;
  }[];
}
