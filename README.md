# Human-in-Loop Workflow System with rollback

A modern, full-stack application that demonstrates human-in-loop workflows with AI agents, built with React, Hono, and Cloudflare Workers. This system enables AI agents to request human intervention when needed.

The key part of my design invloves the event log in the context data of the workflows table. The event log acts as the single source of truth to keep track of the current state of the system. Any updates adds to this array, even a rollback would be another addition to this array. A queue has been implemented using qstash. Any service that requires an external agent to require with is pushed to a queue so that the api is not bogged by i/o hangups. The dynamic ui is also managed by a schema which can be updated as depending on our requirements.

On approval of workflow by the manager, an email is sent to the persons name

The rest of this document has been generated using AI to give a rough overview of the overall structure of the project.

## Features

### Core Functionality
- **AI-Powered Chat Interface**: Interactive chatbot with rich text formatting, image support, and custom widgets
- **Human-in-Loop Workflows**: AI agents can escalate complex decisions to humans
- **Real-time Communication**: Multi-channel support (web portal, email)
- **Workflow Management**: Track and manage workflow states with comprehensive logging
- **Decision Tracking**: Capture human decisions with comments and deadlines

### Technical Features
- **Serverless Architecture**: Built on Cloudflare Workers for global edge deployment
- **Modern React**: React 19 with TypeScript and Tailwind CSS + daisyUI
- **Database Integration**: SQLite with Drizzle ORM for type-safe database operations
- **Queue Management**: Upstash QStash for reliable message queuing
- **API Integration**: RESTful APIs with Hono framework

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** + **daisyUI 5** for modern UI components
- **React Router 7** for navigation
- **TanStack Query** for server state management
- **Axios** for API calls

### Backend
- **Cloudflare Workers** for serverless compute
- **Hono** as the web framework
- **Drizzle ORM** with SQLite for data persistence
- **Upstash QStash** for message queuing
- **Cloudflare AI** for AI model integration

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code linting
- **TypeScript** for type safety
- **Wrangler** for Cloudflare deployment

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd human-in-loop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `wrangler.toml` file with your Cloudflare configuration:
   ```toml
   [env.development.vars]
   QSTASH_URL = "your-qstash-url"
   QSTASH_TOKEN = "your-qstash-token"
   MAIL_TOKEN = "your-mail-token"
   ```

4. **Set up the database**
   ```bash
   npm run studio:dev
   ```

## Quick Start

### Development Mode
```bash
npm run dev
```
This starts the Vite development server with hot module replacement.

### Database Management
```bash
# Open Drizzle Studio for database inspection
npm run studio:dev

# For production database
npm run studio:prd
```

### Building and Deployment
```bash
# Build the project
npm run build

# Type checking and dry run
npm run check

# Deploy to Cloudflare
npm run deploy
```

## Project Structure

```
├── src/
│   ├── const/                 # Constants and type definitions
│   │   ├── EVENT_LIST.ts      # Workflow event types
│   │   ├── STATE_LIST.ts      # Workflow state definitions
│   │   └── WorkflowContext.ts # Core workflow interfaces
│   │
│   ├── react-app/             # Frontend React application
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   └── MessageRenderer.tsx
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Route components
│   │   │   ├── home.tsx
│   │   │   └── Manage.tsx
│   │   └── types/             # TypeScript type definitions
│   │
│   └── worker/                # Cloudflare Worker backend
│       ├── index.ts           # Main worker entry point
│       ├── promptHandler.ts   # AI prompt processing
│       ├── workflows.ts       # Workflow logic
│       ├── db/                # Database configuration
│       │   ├── database.ts
│       │   └── schema.ts
│       └── handler/           # Event handlers
│           └── handlers.ts
│
├── public/                    # Static assets
├── drizzle.config.ts         # Database configuration
├── vite.config.ts            # Vite configuration
└── wrangler.json             # Cloudflare Workers config
```

## API Endpoints

### Health Check
- **GET** `/api/health-check` - System health and database connectivity

### Workflows
- **GET** `/api/workflows` - List all workflows
- **POST** `/api/workflows` - Create a new workflow

### Chat Bot
- **POST** `/api/bot` - Send message to AI chatbot

## Workflow System

### Workflow States
The system supports various workflow states defined in `STATE_LIST.ts`:
- Initialization
- AI Processing
- Human Review Required
- Decision Pending
- Completed/Rejected

### Event Types
Track workflow progress with comprehensive event logging:
- Workflow started
- AI decision made
- Human intervention requested
- Decision submitted
- Workflow completed

### Human Interaction
Support multiple communication channels:
- **Web Portal**: Direct browser interface
- **Email**: Email notifications and responses
- **SMS**: Text message alerts
- **Slack**: Team collaboration integration

## UI Components

### Chat Interface
- Rich text messaging with markdown support
- Image sharing capabilities
- Interactive buttons and quick actions
- Conversation history management

### Management Dashboard
- Workflow monitoring and management
- Decision tracking and analytics
- User role management

### Design System
Built with **daisyUI 5** components:
- Consistent design language
- Responsive layouts
- Accessibility compliance
- Dark/light theme support

## 🧪 Development

### Code Quality
```bash
# Run linting
npm run lint

# Type checking
npm run cf-typegen
```

### Database Migrations
Database schema changes are managed through Drizzle:
```bash
# Generate migration
drizzle-kit generate

# Apply migrations
drizzle-kit migrate
```

## Deployment

### Cloudflare Workers
The application is designed for Cloudflare Workers deployment:

1. **Configure Wrangler**: Update `wrangler.json` with your account details
2. **Set Environment Variables**: Configure secrets in Cloudflare dashboard
3. **Deploy**: Run `npm run deploy`

### Environment Variables
Required environment variables:
- `QSTASH_URL`: Upstash QStash endpoint
- `QSTASH_TOKEN`: Upstash authentication token
- `MAIL_TOKEN`: mailer send token

During local development start upstash queue using
`npx @upstash/qstash-cli dev -port=8081`

## Usage Examples

### Starting a Workflow
```typescript
const workflowContext: WorkflowContext = {
  metadata: {
    workflowType: "customer_support",
    initiator: {
      type: INITIATOR_TYPE.AI_AGENT,
      agentId: "agent-123"
    }
  },
  payload: {
    uiSchema: { /* UI configuration */ },
    uiData: { /* Form data */ }
  },
  humanInteraction: {
    recipient: {
      userId: "user-456",
      channel: COMS_CHANNEL.WEB_PORTAL
    },
    response: {
      submittedAt: null,
      decision: DECISION.PENDING,
      comments: null
    },
    deadline: "2025-10-15T10:00:00Z"
  },
  eventLog: []
};
```

### Chat Integration
```typescript
const response = await fetch('/api/bot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "I need help with my order",
    conversationHistory: []
  })
});
```


## Related Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [daisyUI Components](https://daisyui.com/)
- [Upstash QStash](https://upstash.com/docs/qstash)