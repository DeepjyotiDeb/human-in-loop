// Types and interfaces for the customer service chatbot

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatButton {
  id: string;
  text: string;
  action: "send_message" | "open_url" | "trigger_action";
  value: string;
  style?: "primary" | "secondary" | "accent" | "ghost";
}

export interface ChatImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface FormattedTextBlock {
  type: "heading" | "paragraph" | "list" | "code" | "quote";
  content: string | string[];
  level?: 1 | 2 | 3 | 4 | 5 | 6; // for headings
}

export interface ChatWidget {
  type:
    | "text"
    | "image"
    | "buttons"
    | "formatted"
    | "file"
    | "typing"
    | "carousel";
  content?: string;
  image?: ChatImage;
  buttons?: ChatButton[];
  formattedText?: FormattedTextBlock[];
  file?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  };
  carousel?: {
    items: Array<{
      image?: ChatImage;
      title: string;
      description?: string;
      buttons?: ChatButton[];
    }>;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  timestamp: Date;
  widgets: ChatWidget[];
  isTyping?: boolean;
  user?: User;
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  currentUser: User;
}

export interface ChatContextType {
  state: ChatState;
  sendMessage: (widgets: ChatWidget[]) => void;
  sendBotMessage: (widgets: ChatWidget[]) => void;
  sendTextMessage: (text: string) => void;
  handleButtonClick: (button: ChatButton) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: () => void;
}

// Predefined quick responses for customer service
export interface QuickResponse {
  id: string;
  label: string;
  widgets: ChatWidget[];
}

export const QUICK_RESPONSES: QuickResponse[] = [
  {
    id: "greeting",
    label: "Greeting",
    widgets: [
      {
        type: "text",
        content:
          "👋 Hello! I'm your customer service assistant. How can I help you today?",
      },
      {
        type: "buttons",
        buttons: [
          {
            id: "help_account",
            text: "Account Issues",
            action: "send_message",
            value: "I need help with my account",
          },
          {
            id: "help_billing",
            text: "Billing Questions",
            action: "send_message",
            value: "I have billing questions",
          },
          {
            id: "help_technical",
            text: "Technical Support",
            action: "send_message",
            value: "I need technical support",
          },
          {
            id: "help_other",
            text: "Other",
            action: "send_message",
            value: "I need help with something else",
          },
        ],
      },
    ],
  },
  {
    id: "account_help",
    label: "Account Help",
    widgets: [
      {
        type: "formatted",
        formattedText: [
          { type: "heading", content: "Account Support Options", level: 3 },
          {
            type: "paragraph",
            content: "I can help you with various account-related issues:",
          },
          {
            type: "list",
            content: [
              "Password reset",
              "Profile updates",
              "Account settings",
              "Security settings",
            ],
          },
        ],
      },
      {
        type: "buttons",
        buttons: [
          {
            id: "reset_password",
            text: "Reset Password",
            action: "trigger_action",
            value: "password_reset",
          },
          {
            id: "update_profile",
            text: "Update Profile",
            action: "trigger_action",
            value: "profile_update",
          },
        ],
      },
    ],
  },
];
