import React, { useState } from "react";
import { ChatWidget } from "../types/chat";

interface ChatInputProps {
  onSendMessage: (widgets: ChatWidget[]) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState("");
  //   const [isUploading, setIsUploading] = useState(false);
  //   const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      const widgets: ChatWidget[] = [
        {
          type: "text",
          content: message.trim(),
        },
      ];
      onSendMessage(widgets);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  //   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0];
  //     if (file && onFileUpload) {
  //       setIsUploading(true);
  //       try {
  //         // Simulate file upload - in a real app, you'd upload to your server
  //         await new Promise((resolve) => setTimeout(resolve, 1000));

  //         const fileWidget: ChatWidget = {
  //           type: "file",
  //           file: {
  //             name: file.name,
  //             url: URL.createObjectURL(file), // In production, use actual uploaded URL
  //             type: file.type,
  //             size: file.size,
  //           },
  //         };

  //         onSendMessage([fileWidget]);
  //         onFileUpload(file);
  //       } catch (error) {
  //         console.error("File upload failed:", error);
  //       } finally {
  //         setIsUploading(false);
  //         if (fileInputRef.current) {
  //           fileInputRef.current.value = "";
  //         }
  //       }
  //     }
  //   };

  //   const triggerFileUpload = () => {
  //     fileInputRef.current?.click();
  //   };

  return (
    <div className="border-t border-base-300 bg-base-100 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File upload input (hidden) */}
        {/* <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        /> */}

        {/* File upload button */}
        {/* <button
          type="button"
          onClick={triggerFileUpload}
          disabled={disabled || isUploading}
          className="btn btn-ghost btn-sm btn-square"
          title="Upload file"
        >
          {isUploading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          )}
        </button> */}

        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="textarea textarea-bordered w-full resize-none"
            rows={1}
            style={{
              minHeight: "2.5rem",
              maxHeight: "8rem",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="btn btn-primary btn-sm"
          title="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>

      {/* Quick action buttons */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSendMessage([{ type: "text", content: "Hello" }])}
          disabled={disabled}
          className="btn btn-xs btn-ghost"
        >
          👋 Hello
        </button>
        <button
          type="button"
          onClick={() =>
            onSendMessage([{ type: "text", content: "I need help" }])
          }
          disabled={disabled}
          className="btn btn-xs btn-ghost"
        >
          ❓ I need help
        </button>
        <button
          type="button"
          onClick={() =>
            onSendMessage([{ type: "text", content: "Thank you" }])
          }
          disabled={disabled}
          className="btn btn-xs btn-ghost"
        >
          🙏 Thank you
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
