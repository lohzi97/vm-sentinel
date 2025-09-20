# 4. Technical Assumptions

## 4.1. Repository Structure: Monorepo

A monorepo structure is recommended to house both the VM agent and the Telegram bot backend in a single repository. This simplifies dependency management and cross-service changes during initial development.

## 4.2. Service Architecture

The system will use a decoupled, serverless architecture. The Telegram bot will be a serverless function hosted on Google Cloud Functions. It will communicate with the VM agent via a Google Cloud Pub/Sub message bus, ensuring the VM does not need to expose any open inbound ports.

## 4.3. Testing Requirements

The project will require **Unit and Integration testing**. Unit tests should cover critical business logic within the agent and bot independently. Integration tests must verify the end-to-end communication flow between the agent, Google Cloud Pub/Sub, and the bot.

## 4.4. Additional Technical Assumptions and Requests

*   **Language/Runtime:** The VM agent and the bot backend will be developed using Node.js (v18.x LTS or higher).
*   **Cloud Provider:** The project will use Google Cloud Platform for the serverless backend (Cloud Functions) and messaging (Pub/Sub).
*   **Target Operating System:** The VM agent is specifically targeted to run on Debian 12 ("Bookworm") with an XFCE desktop environment.
*   **System Dependencies:** The agent requires the `scrot` and `xinput` command-line utilities to be installed on the host VM.
*   **Data Storage:** For the MVP, no external database is required. System statistics will be logged to a local CSV file.

---