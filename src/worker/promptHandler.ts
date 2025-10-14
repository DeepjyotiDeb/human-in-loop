interface Message {
  role: "user" | "assistant";
  content: string;
}

export const promptHandler = (
  userMessage: string,
  conversationHistory: Message[]
): string => {
  // The new, more intelligent prompt
  let unifiedPrompt = `You are an expert expense-processing assistant. Your goal is to extract expense details (name, amount, reason) from the user's message.
  All expense amounts are in INR.

1.  **Analyze the User's Message**: Carefully review the current message in the context of the conversation history.
2.  **Extract Details**: If the message contains all required details (name, amount, AND reason), extract them. In this case, the 'status' should be 'complete'.
3.  **Ask for Missing Info**: If one or more details are missing, do NOT extract partial data. Instead, set the 'status' to 'incomplete' and generate a friendly, concise 'replyMessage' that politely asks the user for the exact information that is missing.

Previous conversation:
${conversationHistory
  .map(
    (msg) => `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}`
  )
  .join("\n")}

Current message: ${userMessage}`;
  return unifiedPrompt;
};

export const responseSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["complete", "incomplete"],
      description:
        "Set to 'complete' if all info was found, otherwise 'incomplete'.",
    },
    extractedData: {
      type: ["object", "null"],
      properties: {
        name: { type: "string" },
        amount: { type: "number" },
        reason: { type: "string" },
      },
      description:
        "The extracted expense details. This should be null if status is 'incomplete'.",
    },
    replyMessage: {
      type: ["string", "null"],
      description:
        "The conversational response asking for missing info. This should be null if status is 'complete'.",
    },
  },
  required: ["status"],
};
