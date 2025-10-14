import { useContext } from "react";
import { ChatContext } from "../contexts/ChatContext";
import { ChatContextType } from "../types/chat";

// Custom hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
