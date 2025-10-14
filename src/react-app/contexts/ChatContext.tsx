import React, { createContext, useReducer, ReactNode } from "react";
import {
  ChatState,
  ChatContextType,
  ChatMessage,
  ChatWidget,
  ChatButton,
  User,
} from "../types/chat";
import axios from "axios";

// Initial state
const initialUser: User = {
  id: "user-1",
  name: "Customer",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
};

const initialState: ChatState = {
  messages: [],
  isConnected: true,
  isTyping: false,
  currentUser: initialUser,
};

// Action types
type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "CLEAR_CHAT" }
  | { type: "SET_CONNECTED"; payload: boolean };

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false,
      };
    case "SET_TYPING":
      return {
        ...state,
        isTyping: action.payload,
      };
    case "CLEAR_CHAT":
      return {
        ...state,
        messages: [],
      };
    case "SET_CONNECTED":
      return {
        ...state,
        isConnected: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Generate unique message ID
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  // Generate bot response using the real API
  const generateBotResponse = async (
    userMessage: string
  ): Promise<ChatWidget[]> => {
    try {
      // Prepare conversation history for context
      const conversationHistory = state.messages.map((msg) => {
        const textContent = msg.widgets
          .filter((w) => w.type === "text")
          .map((w) => w.content)
          .join(" ");

        return {
          role: msg.sender === "user" ? "user" : "assistant",
          content: textContent,
        };
      });

      // Add the current user message
      conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Send the conversation context to the API
      const payload = {
        message: userMessage,
        conversationHistory: conversationHistory,
      };

      const response = await axios.post("/api/bot", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("data", response.data);
      const data = response.data;
      const botMessage =
        data.message || "Sorry, I could not process your request.";
      // if the
      if (state.isTyping) {
        dispatch({ type: "SET_TYPING", payload: false });
      }
      return [
        {
          type: "text",
          content: botMessage,
        },
      ];
    } catch (error) {
      console.error("Error calling bot API:", error);
      return [
        {
          type: "text",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ];
    }
  };

  // Send user message function
  const sendMessage = async (widgets: ChatWidget[]) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      sender: "user",
      timestamp: new Date(),
      widgets,
      user: state.currentUser,
    };

    dispatch({ type: "ADD_MESSAGE", payload: message });

    // Show typing indicator
    // setTimeout(() => {
    dispatch({ type: "SET_TYPING", payload: true });
    // }, 500);

    // Get bot response from API
    const textContent = widgets
      .filter((w) => w.type === "text")
      .map((w) => w.content)
      .join(" ");

    try {
      const botWidgets = await generateBotResponse(textContent || "");

      const botResponse: ChatMessage = {
        id: generateMessageId(),
        sender: "bot",
        timestamp: new Date(),
        widgets: botWidgets,
        user: {
          id: "bot-1",
          name: "Customer Service Bot",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=customerbot",
        },
      };

      dispatch({ type: "ADD_MESSAGE", payload: botResponse });
    } catch (error) {
      console.error("Error getting bot response:", error);

      const errorResponse: ChatMessage = {
        id: generateMessageId(),
        sender: "bot",
        timestamp: new Date(),
        widgets: [
          {
            type: "text",
            content:
              "Sorry, I'm having trouble responding right now. Please try again later.",
          },
        ],
        user: {
          id: "bot-1",
          name: "Customer Service Bot",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=customerbot",
        },
      };

      dispatch({ type: "ADD_MESSAGE", payload: errorResponse });
    }
  };

  // Send bot message function (no auto-response)
  const sendBotMessage = (widgets: ChatWidget[]) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      sender: "bot",
      timestamp: new Date(),
      widgets,
      user: {
        id: "bot-1",
        name: "Customer Service Bot",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=customerbot",
      },
    };

    dispatch({ type: "ADD_MESSAGE", payload: message });
  };

  // Send text message (convenience function)
  const sendTextMessage = (text: string) => {
    sendMessage([{ type: "text", content: text }]);
  };

  // Handle button clicks
  const handleButtonClick = (button: ChatButton) => {
    switch (button.action) {
      case "send_message":
        sendTextMessage(button.value);
        break;
      case "open_url":
        window.open(button.value, "_blank");
        break;
      case "trigger_action":
        // Handle custom actions with specific responses
        handleCustomAction(button.value);
        break;
    }
  };

  // Handle custom actions by sending them to the bot API
  const handleCustomAction = (actionValue: string) => {
    console.log("Triggering action:", actionValue);

    // Convert the action into a natural language request and send to bot
    const actionMessage = `I want to ${actionValue.replace(/_/g, " ")}`;
    sendTextMessage(actionMessage);
  };

  // Set typing indicator
  const setTyping = (isTyping: boolean) => {
    dispatch({ type: "SET_TYPING", payload: isTyping });
  };

  // Clear chat
  const clearChat = () => {
    dispatch({ type: "CLEAR_CHAT" });
  };

  const contextValue: ChatContextType = {
    state,
    sendMessage,
    sendBotMessage,
    sendTextMessage,
    handleButtonClick,
    setTyping,
    clearChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

// Export context for custom hook
export { ChatContext };
