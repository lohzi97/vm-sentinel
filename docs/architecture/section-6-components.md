# Section 6: Components

## Component: VM Agent
**Responsibility:** This is the core monitoring service that runs on the user's virtual machine. Its primary job is to watch for user activity, decide if the machine is idle, and execute commands sent from the user.

**Key Interfaces:**
- **Publishes to:** `vm-status-topic`, `vm-alerts-topic` (sending `StatusMessage` and `AlertMessage` models).
- **Subscribes to:** `vm-commands-topic` (receiving `CommandMessage` model).
- **Reads from:** Local `config.json` file for startup configuration.
- **Executes:** Local system commands (`shutdown`, `scrot`, `xinput`).

**Dependencies:** Google Cloud Pub/Sub, a Debian-based OS with XFCE, Node.js runtime.

**Technology Stack:** Node.js, pino (logging).

## Component: Bot Backend
**Responsibility:** This serverless function is the brain of the user-facing bot. It authenticates the user, interprets their commands, and acts as the bridge to the VM Agent via the Communication Bus.

**Key Interfaces:**
- **Receives:** HTTP POST requests from the Telegram Webhook API.
- **Sends to:** Telegram Bot API via HTTP to post messages and buttons to the user.
- **Subscribes to:** `vm-status-topic`, `vm-alerts-topic`.
- **Publishes to:** `vm-commands-topic`.

**Dependencies:** Telegram API, Google Cloud Pub/Sub.

**Technology Stack:** Node.js, Express.js, esbuild.

## Component: Communication Bus
**Responsibility:** This is not an application, but the central nervous system of the project. It consists of dedicated message topics that ensure secure and reliable asynchronous communication between the Agent and the Bot.

**Key Interfaces:**
- **`vm-status-topic`:** A channel for the agent to send routine metric updates.
- **`vm-alerts-topic`:** A high-priority channel for the agent to send critical idle alerts.
- **`vm-commands-topic`:** A channel for the bot to send commands down to the agent.

**Dependencies:** None. It is the central dependency for other components.

**Technology Stack:** Google Cloud Pub/Sub.
