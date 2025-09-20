# 7. Epic 2: Remote Control via Telegram

This epic focuses on building the communication bridge between the user and the VM agent. The objective is to implement the Telegram bot and the secure cloud messaging backbone, enabling users to remotely query their VM for statistics and, most importantly, shut it down on command. This delivers the core remote control value proposition of the product.

## Story 2.1: Google Pub/Sub Setup & Agent Integration

**As a developer, I want to set up the necessary Google Cloud Pub/Sub topics and integrate the agent, so that the VM can securely publish messages to the cloud.**
*(Prerequisite: Epic 1)*

### Acceptance Criteria:

1.  A Pub/Sub topic is created for the agent to send status messages (e.g., `vm-status-topic`).
2.  A separate Pub/Sub topic is created for the bot to send commands to the agent (e.g., `vm-commands-topic`).
3.  The agent is configured with the necessary service account credentials to authenticate with Google Cloud.
4.  The agent can successfully publish a JSON-formatted message containing the metrics from Epic 1 to the `vm-status-topic`.

## Story 2.2: Basic Telegram Bot and Authentication

**As a developer, I want to create a basic, secure Telegram bot as a serverless function, so that it can serve as the user's command interface.**
*(Prerequisite: Story 2.1)*

### Acceptance Criteria:

1.  A new Telegram bot is created and its token is securely stored.
2.  A Google Cloud Function is created to act as the bot's webhook endpoint.
3.  The bot correctly validates that incoming messages originate from a pre-configured, authorized Telegram Chat ID.
4.  Messages from unauthorized users are ignored and optionally logged for security monitoring.
5.  The bot responds to a `/start` or `/help` command with a simple message listing available commands.

## Story 2.3: Implement `/stats` Command

**As a user, I want to type `/stats` in Telegram and receive the latest metrics from my VM, so that I can check its status on demand.**
*(Prerequisite: Story 2.2)*

### Acceptance Criteria:

1.  The bot subscribes to the `vm-status-topic` to receive metric updates from the agent.
2.  When the user sends the `/stats` command, the bot responds with the most recently received CPU usage, RAM usage, and last user input time.
3.  The response is formatted in a clear, human-readable way.
4.  If no metrics have been received from the agent yet, the bot responds with a message indicating the agent may be offline.

## Story 2.4: Implement `/shutdown` Command

**As a user, I want to type `/shutdown` in Telegram to gracefully shut down my VM, so that I can save costs when I'm away from my computer.**
*(Prerequisite: Story 2.3)*

### Acceptance Criteria:

1.  When the bot receives a `/shutdown` command, it publishes a "shutdown" command message to the `vm-commands-topic`.
2.  The agent on the VM is subscribed to the `vm-commands-topic`.
3.  Upon receiving the "shutdown" message, the agent executes a graceful system shutdown command (e.g., `sudo shutdown now`).
4.  The bot sends a confirmation message to the user (e.g., "Shutdown command sent to VM Sentinel.").

---