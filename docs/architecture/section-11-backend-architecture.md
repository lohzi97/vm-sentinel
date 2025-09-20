# Section 11: Backend Architecture

Our backend is a distributed system composed of a serverless cloud component (the Bot) and a traditional, long-running service component (the Agent).

### Service Architecture
This defines how each backend component is structured.

**1. Bot Backend (Serverless Architecture)**
The bot runs as a Google Cloud Function, which is inherently serverless.

*   **Function Organization:**
    ```
    /packages/bot/
    ├── src/
    │   ├── handlers/      # Logic for specific commands/actions
    │   │   ├── commands.ts
    │   │   └── actions.ts
    │   ├── services/      # Clients for external services (e.g., Pub/Sub)
    │   │   └── pubsub.ts
    │   ├── bot.ts         # Telegraf instance setup and middleware
    │   └── index.ts       # Main Cloud Function entry point (Express app)
    ├── tests/
    └── package.json
    ```
*   **Function Template (Conceptual `index.ts`):**
    ```typescript
    import express from 'express';
    import { bot } from './bot'; // Telegraf instance

    // Create an Express app
    const app = express();
    
    // Use Telegraf's webhook handler
    app.use(bot.webhookCallback('/secret-path'));

    // Export the Express app as a Cloud Function
    export const telegramWebhook = app;
    ```

**2. VM Agent (Traditional Service Architecture)**
The agent is a standard Node.js process designed to run continuously on the VM (e.g., using `pm2` or `systemd`).

*   **Module/Service Organization:**
    ```
    /packages/agent/
    ├── src/
    │   ├── modules/         # Core functionalities as separate modules
    │   │   ├── SystemMonitor.ts
    │   │   ├── InputMonitor.ts
    │   │   ├── ScreenMonitor.ts
    │   │   ├── IdleManager.ts
    │   │   ├── PubSubClient.ts
    │   │   └── CsvLogger.ts
    │   ├── config.ts        # Configuration loader
    │   └── index.ts         # Main service entry point
    ├── tests/
    └── package.json
    ```
*   **Service Template (Conceptual `index.ts`):**
    ```typescript
    import { AgentConfig, loadConfig } from './config';
    import { SystemMonitor } from './modules/SystemMonitor';
    // ... import other modules

    class AgentService {
      constructor(private config: AgentConfig) {
        // Initialize all modules
        const pubSubClient = new PubSubClient(config);
        const systemMonitor = new SystemMonitor(config, pubSubClient);
        // ... etc.
      }

      start() {
        console.log('VM Sentinel Agent started.');
        // Start all monitoring loops
      }
    }

    const config = loadConfig();
    const agent = new AgentService(config);
    agent.start();
    ```

### Database Architecture
- **Schema Design:** As defined in the **Section 9: Database Schema**, the only data store is a local `metrics.csv` file on the VM.
- **Data Access Layer:** A simple `CsvLogger` module in the VM Agent will be responsible for appending new rows to the `metrics.csv` file. This module will abstract the file I/O operations.

### Authentication and Authorization
- **Auth Flow (Bot Backend):** The primary authentication happens the moment a message arrives from Telegram.
  ```mermaid
  sequenceDiagram
      participant User
      participant Telegram API
      participant Bot Backend
      
      User->>Telegram API: Sends message
      Telegram API-->>Bot Backend: POST /webhook
      
      activate Bot Backend
      Note over Bot Backend: Get chat.id from payload
      alt Authorized User
          Bot Backend->>Bot Backend: ctx.chat.id === env.AUTH_CHAT_ID
          Note over Bot Backend: Proceed with command logic
      else Unauthorized User
          Bot Backend->>Bot Backend: ctx.chat.id !== env.AUTH_CHAT_ID
          Note over Bot Backend: Log and terminate immediately
      end
      deactivate Bot Backend
  ```
- **Auth Middleware:** This flow is implemented as the very first check in the bot's webhook handler, effectively acting as a global authentication middleware. The VM Agent requires no auth logic, as it implicitly trusts all commands arriving from its dedicated, secure Pub/Sub command topic, which only the authenticated bot can publish to.
