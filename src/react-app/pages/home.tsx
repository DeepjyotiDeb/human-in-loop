import axios from "axios";
import { useState } from "react";
import { ChatProvider } from "../contexts/ChatContext";
import ChatWidget from "../components/ChatWidget";

const Home = () => {
  const [name, setName] = useState("World");
  const [showChat, setShowChat] = useState(true);

  const apiCall = async () => {
    const res = await axios.get("/api/health-check");
    console.log("res", res.data);
    // fetch("/api/")
    //   .then((res) => res.json() as Promise<{ name: string }>)
    //   .then((data) => setName(data.name));
  };

  const startWorkflow = () => {
    fetch("/api/workflows", { method: "POST" })
      .then((res) => res.json() as Promise<{ message: string }>)
      .then((data) => console.log(data.message));
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">Human-in-Loop Demo</h1>
        </div>
        <div className="navbar-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? "Hide Chat" : "💬 Customer Service"}
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Welcome, {name}!</h2>
                <p>
                  This is a demo application showcasing a emloyee expense
                  approval workflow with human-in-the-loop capabilities,
                  integrated with an AI chatbot.
                </p>
              </div>
            </div>
            {/* route to manager's page */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="card-actions">
                  <a href="/manage" className="btn btn-primary" target="_blank">
                    {" "}
                    Go to Manager's Page{" "}
                  </a>
                </div>
              </div>
            </div>

            {/* <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">🤖 Chatbot Features</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="badge badge-primary">✨</div>
                    <span>
                      Rich text formatting with headings, lists, and code blocks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="badge badge-secondary">🖼️</div>
                    <span>Image support with captions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="badge badge-accent">🔘</div>
                    <span>Interactive buttons for quick actions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="badge badge-info">📎</div>
                    <span>File upload and sharing capabilities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="badge badge-success">🎠</div>
                    <span>Carousel widgets for multiple options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="badge badge-warning">⚡</div>
                    <span>Real-time typing indicators</span>
                  </div>
                </div>

                <div className="alert alert-info mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Try the chatbot!</h3>
                    <div className="text-xs">
                      Click the "Customer Service" button to open the chat
                      widget and test various features like account help,
                      billing questions, or technical support.
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Chat Widget */}
          <div className="space-y-6">
            {showChat && (
              <ChatProvider>
                <div className="sticky top-6">
                  <ChatWidget
                    height="700px"
                    title="Sumi ✨"
                    onClose={() => setShowChat(false)}
                  />
                </div>
              </ChatProvider>
            )}

            {!showChat && (
              <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-2xl mb-4">
                    🚀 Ready to chat?
                  </h2>
                  <p className="mb-6">
                    Our AI-powered customer service chatbot is standing by to
                    help you with:
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <div className="text-sm">👤 Account Issues</div>
                    <div className="text-sm">💳 Billing Questions</div>
                    <div className="text-sm">🔧 Technical Support</div>
                    <div className="text-sm">❓ General Help</div>
                  </div>
                  <button
                    className="btn btn-accent btn-lg"
                    onClick={() => setShowChat(true)}
                  >
                    Start Chatting
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
