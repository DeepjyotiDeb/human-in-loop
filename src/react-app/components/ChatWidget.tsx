import React, { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import MessageRenderer from "./MessageRenderer";
import ChatInput from "./ChatInput";

interface ChatWidgetProps {
  className?: string;
  height?: string;
  title?: string;
  showHeader?: boolean;
  onClose?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  className = "",
  height = "600px",
  title = "Customer Service",
  showHeader = true,
  onClose,
}) => {
  const { state, sendMessage, sendBotMessage, handleButtonClick, clearChat } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isTyping]);

  // Send welcome message on mount
  useEffect(() => {
    if (state.messages.length === 0) {
      const timer = setTimeout(() => {
        const welcomeWidgets = [
          {
            type: "text" as const,
            content:
              "👋 Hello! Welcome to our customer service. I'm here to help you with any questions or concerns you may have.",
          },
          {
            type: "buttons" as const,
            buttons: [
              {
                id: "help_account",
                text: "👤 Account Issues",
                action: "send_message" as const,
                value: "I need help with my account",
                style: "primary" as const,
              },
              {
                id: "help_billing",
                text: "💳 Billing Questions",
                action: "send_message" as const,
                value: "I have billing questions",
                style: "secondary" as const,
              },
              {
                id: "help_technical",
                text: "🔧 Technical Support",
                action: "send_message" as const,
                value: "I need technical support",
                style: "accent" as const,
              },
              {
                id: "help_general",
                text: "❓ General Help",
                action: "send_message" as const,
                value: "I need general help",
                style: "ghost" as const,
              },
            ],
          },
        ];

        sendBotMessage(welcomeWidgets);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.messages.length, sendBotMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
    // In a real application, you would handle file upload to your server here
  };

  return (
    <div
      className={`card bg-base-100 shadow-xl ${className}`}
      style={{ height }}
    >
      {/* Header */}
      {showHeader && (
        <div className="card-header bg-primary text-primary-content p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=customerbot"
                    alt="Bot"
                  />
                </div>
              </div>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      state.isConnected ? "bg-success" : "bg-error"
                    }`}
                  ></div>
                  <span>{state.isConnected ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="btn btn-ghost btn-sm btn-square"
                title="Clear chat"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-square"
                  title="Close chat"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ height: "calc(100% - 140px)" }}
      >
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.sender === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-8 h-8 rounded-full">
                <img
                  src={
                    message.user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`
                  }
                  alt={message.user?.name || message.sender}
                />
              </div>
            </div>

            <div className="chat-header">
              <span className="text-sm font-medium">
                {message.user?.name ||
                  (message.sender === "user" ? "You" : "Support")}
              </span>
              <time className="text-xs opacity-50 ml-2">
                {formatTime(message.timestamp)}
              </time>
            </div>

            <div
              className={`chat-bubble ${
                message.sender === "user"
                  ? "chat-bubble-primary"
                  : "chat-bubble-secondary"
              } max-w-xs lg:max-w-md`}
            >
              <MessageRenderer
                widgets={message.widgets}
                onButtonClick={handleButtonClick}
                isBot={message.sender === "bot"}
              />
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {state.isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-8 h-8 rounded-full">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=customerbot"
                  alt="Bot"
                />
              </div>
            </div>
            <div className="chat-bubble chat-bubble-secondary">
              <div className="flex items-center gap-2">
                <span className="loading loading-dots loading-sm"></span>
                <span className="text-sm opacity-70">Support is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={sendMessage}
        onFileUpload={handleFileUpload}
        disabled={!state.isConnected}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default ChatWidget;
