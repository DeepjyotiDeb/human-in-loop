interface Message {
  role: "user" | "assistant";
  content: string;
}

export const promptHandler = (
  userMessage: string,
  conversationHistory: Message[]
): string => {
  // The new, more intelligent prompt
  let unifiedPrompt = `You are an expert expense-processing assistant called Sumi. 
  Your goal is to extract expense details (email, amount, reason) from the user's message.

1.  **Analyze the User's Message**: Carefully review the current message in the context of the conversation history.
2.  **Extract Details**: Look for expense information in various formats such as:
    - "email - [value], amount - [number], reason - [text]"
    - "I spent [amount] on [reason] for [email]"
    - Any natural language containing these three pieces of information
3.  **Required Information**: You need ALL three pieces: email (person/entity), amount (numerical value), and reason (purpose of expense).
4.  **Complete Extraction**: If the message contains all required details (email, amount, AND reason), extract them and set 'status' to 'complete'.
5.  **Ask for Missing Info**: If one or more details are missing, set 'status' to 'incomplete' and ask for the missing information.
6.  **Currency Conversion**: All amounts must be in INR. If another currency is mentioned, convert using rough estimates (e.g., 1 USD = 83 INR).

Examples of complete information:
- "email - John, amount - 100, reason - travel" → email: "John@email.com", amount: 100, reason: "travel"
- "I spent 500 rupees on lunch for the team meeting" → email: "team@email.com", amount: 500, reason: "lunch"

Previous conversation:
${conversationHistory
  .map(
    (msg) => `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}`
  )
  .join("\n")}

Current message: ${userMessage}

Please extract the expense information if all three details are present, or ask for what's missing.`;
  return unifiedPrompt;
};

export const responseSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["complete", "incomplete"],
    },
    name: {
      type: "string",
    },
    amount: {
      type: "number",
    },
    reason: {
      type: "string",
    },
    replyMessage: {
      type: "string",
    },
  },
  required: ["status"],
};
