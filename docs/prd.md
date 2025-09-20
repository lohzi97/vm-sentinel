# VM Sentinel Product Requirements Document (PRD)

## 1. Goals and Background Context

### 1.1. Goals

The primary goals for VM Sentinel are:
*   **Reduce Cloud Waste:** Directly decrease operational costs for users by eliminating billing for idle VM hours.
*   **Drive Adoption:** Create a valuable and easy-to-use utility that becomes an essential tool for the target user base.
*   **Effortless Control:** Users feel they can easily and reliably shut down their VM from anywhere, at any time.
*   **Trust in the System:** Users are confident that the service will not incorrectly shut down their machine during an active session.
*   **Tangible Cost Savings:** Users can point to a noticeable reduction in their monthly cloud bills as a direct result of using VM Sentinel.

### 1.2. Background Context

Users of cloud-based virtual machines, particularly those with graphical user interfaces (GUIs), often leave instances running when not in use, leading to significant and unnecessary costs. Remembering to manually shut down a VM is inconvenient, and existing cloud provider tools lack intelligent idleness detection that can distinguish between a truly idle machine and one where a user is present but passive (e.g., reading or observing a long-running process).

VM Sentinel solves this by running a lightweight agent on the VM that monitors a combination of system resources, user input, and screen changes to accurately determine idleness. When a VM is confirmed to be idle, the user receives an alert via a Telegram bot with an option to shut the machine down remotely, providing a simple and effective way to manage cloud resources and reduce costs.

### 1.3. Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-16 | 1.0 | Initial PRD draft based on Project Brief. | John (PM) |

---
## 2. Requirements

### 2.1. Functional

*   **FR1:** The system must provide a VM agent that monitors CPU usage, RAM usage, and keyboard/mouse input to track user activity.
*   **FR2:** The VM agent must periodically capture and compare screenshots to detect visual changes on the screen as an indicator of activity.
*   **FR3:** The VM agent must trigger an idle alert only after a user-configurable period of inactivity has been met.
*   **FR4:** All communication between the VM agent and the backend bot must be securely handled via Google Cloud Pub/Sub.
*   **FR5:** The system must provide a Telegram bot to deliver idle alerts and process user commands.
*   **FR6:** The Telegram bot must accept and execute a `/shutdown` command to gracefully shut down the target VM.
*   **FR7:** The Telegram bot must accept and execute a `/stats` command to return on-demand system statistics from the VM.
*   **FR8:** The Telegram bot must validate that all incoming commands originate from a pre-authorized Telegram Chat ID.

### 2.2. Non-Functional

*   **NFR1:** The VM agent must be designed to run on Debian 12 ("Bookworm") with an XFCE desktop environment.
*   **NFR2:** The VM agent's baseline resource usage must not exceed 50MB of RAM and 2% average CPU utilization.
*   **NFR3:** The VM agent and Telegram bot backend must be developed using the Node.js (v18.x LTS or higher) runtime.
*   **NFR4:** For the MVP, system statistics must be logged to a local CSV file on the VM.
*   **NFR5:** The VM agent requires `scrot` and `xinput` to be pre-installed on the host operating system.
*   **NFR6:** The end-to-end setup process must be clearly documented and completable by a target user in under 15 minutes.

---
## 3. User Interface Design Goals

### 3.1. Overall UX Vision

The user experience will be a minimal, text-based conversational interface delivered via Telegram. The vision is to provide an "easy to turn off" utility that feels as simple and immediate as sending a text message. The UI should be fast, reliable, and require no learning curve for a user familiar with basic bot commands.

### 3.2. Key Interaction Paradigms

The primary interaction paradigm is a command-driven chatbot. Users will interact with the system by issuing explicit slash commands (e.g., `/shutdown`, `/stats`). The bot will respond with concise, informative messages. The only proactive interaction from the bot will be the critical idle-state notification.

### 3.3. Core Screens and Views

In the context of the Telegram bot, "screens" are the key messages the user will see:

*   **Idle Alert Message:** A notification message containing a current screenshot of the VM, key stats (CPU, RAM), and clear "Shutdown" and "Ignore" action buttons.
*   **`/stats` Response:** A message displaying the current CPU usage, RAM usage, and other relevant system metrics.
*   **`/shutdown` Confirmation:** A simple confirmation message acknowledging that the shutdown command has been received and is being executed.
*   **Help/Welcome Message:** A message outlining the available commands and their function, sent when a user first interacts with the bot or requests help.

### 3.4. Accessibility: None

For the MVP, no specific accessibility requirements beyond the native features of the Telegram client are in scope. The interface is purely text-and-button-based, making it inherently compatible with screen readers.

### 3.5. Branding

There are no specific branding or style guide requirements for the MVP.

### 3.6. Target Device and Platforms: Cross-Platform

The interface is Telegram, which is accessible across all platforms supported by the Telegram client (iOS, Android, Web, Desktop).

---
## 4. Technical Assumptions

### 4.1. Repository Structure: Monorepo

A monorepo structure is recommended to house both the VM agent and the Telegram bot backend in a single repository. This simplifies dependency management and cross-service changes during initial development.

### 4.2. Service Architecture

The system will use a decoupled, serverless architecture. The Telegram bot will be a serverless function hosted on Google Cloud Functions. It will communicate with the VM agent via a Google Cloud Pub/Sub message bus, ensuring the VM does not need to expose any open inbound ports.

### 4.3. Testing Requirements

The project will require **Unit and Integration testing**. Unit tests should cover critical business logic within the agent and bot independently. Integration tests must verify the end-to-end communication flow between the agent, Google Cloud Pub/Sub, and the bot.

### 4.4. Additional Technical Assumptions and Requests

*   **Language/Runtime:** The VM agent and the bot backend will be developed using Node.js (v18.x LTS or higher).
*   **Cloud Provider:** The project will use Google Cloud Platform for the serverless backend (Cloud Functions) and messaging (Pub/Sub).
*   **Target Operating System:** The VM agent is specifically targeted to run on Debian 12 ("Bookworm") with an XFCE desktop environment.
*   **System Dependencies:** The agent requires the `scrot` and `xinput` command-line utilities to be installed on the host VM.
*   **Data Storage:** For the MVP, no external database is required. System statistics will be logged to a local CSV file.

---
## 5. Epic List

*   **Epic 1: Foundational Monitoring Agent:** Establish the project foundation and create a VM agent capable of monitoring system metrics (CPU, RAM, input) and logging them locally.
*   **Epic 2: Remote Control via Telegram:** Implement the Telegram bot and secure cloud communication layer (Pub/Sub) to enable remote VM shutdown and statistics retrieval with `/shutdown` and `/stats` commands.
*   **Epic 3: Intelligent Idle Detection and Alerting:** Introduce screenshot comparison logic and a configurable timer to the agent to intelligently detect an idle state and proactively alert the user via Telegram.

---
## 6. Epic 1: Foundational Monitoring Agent

This epic establishes the core foundation of the VM Sentinel project. The objective is to create a runnable agent that can successfully monitor key system resources and user input on the target VM and record them. This provides the fundamental data-gathering capability required for all subsequent features.

### Story 1.1: Project Scaffolding

**As a developer, I want a well-structured monorepo with initial project setup, so that I can begin developing the agent and bot in a clean and organized environment.**

#### Acceptance Criteria:

1.  A Git repository is initialized.
2.  A `README.md` file is created with a basic project description.
3.  A monorepo structure is in place (e.g., using npm workspaces) with `packages/agent` and `packages/bot` directories.
4.  Each package has its own `package.json` file with basic metadata.
5.  A root-level `package.json` manages the workspaces and common dev dependencies (e.g., a linter).

### Story 1.2: System Resource Monitoring

**As the system, I want to monitor CPU and RAM usage periodically, so that I have the data needed to assess machine activity.**

#### Acceptance Criteria:

1.  The agent can read the current system-wide CPU utilization as a percentage.
2.  The agent can read the current system-wide RAM usage as a percentage.
3.  This data is captured at a configurable interval (e.g., every 5 seconds).
4.  The monitoring functions are encapsulated in their own module.
5.  The resource usage data is available within the main agent service for further processing.

### Story 1.3: User Input Monitoring

**As the system, I want to detect keyboard and mouse activity, so that I can determine if a user is physically interacting with the machine.**
*(Prerequisite: Story 1.2)*

#### Acceptance Criteria:

1.  The agent can detect when a keyboard key is pressed.
2.  The agent can detect when the mouse is moved or a button is clicked.
3.  A simple "last input time" timestamp is updated upon any detected input.
4.  The monitoring is done by polling the state of input devices using `xinput` or a similar tool.
5.  The "last input time" is available within the main agent service.

### Story 1.4: Local CSV Logging

**As a developer, I want the collected metrics (CPU, RAM, input activity) to be written to a local CSV file, so that I can verify the agent is working correctly and analyze the data during development.**
*(Prerequisite: Story 1.3)*

#### Acceptance Criteria:

1.  A new entry is appended to a `metrics.csv` file at a regular interval.
2.  The CSV entry contains a timestamp, CPU usage (%), RAM usage (%), and the timestamp of the last user input.
3.  The CSV file is created if it does not exist.
4.  The logging mechanism correctly handles file access and does not crash if the file is temporarily unavailable.

---
## 7. Epic 2: Remote Control via Telegram

This epic focuses on building the communication bridge between the user and the VM agent. The objective is to implement the Telegram bot and the secure cloud messaging backbone, enabling users to remotely query their VM for statistics and, most importantly, shut it down on command. This delivers the core remote control value proposition of the product.

### Story 2.1: Google Pub/Sub Setup & Agent Integration

**As a developer, I want to set up the necessary Google Cloud Pub/Sub topics and integrate the agent, so that the VM can securely publish messages to the cloud.**
*(Prerequisite: Epic 1)*

#### Acceptance Criteria:

1.  A Pub/Sub topic is created for the agent to send status messages (e.g., `vm-status-topic`).
2.  A separate Pub/Sub topic is created for the bot to send commands to the agent (e.g., `vm-commands-topic`).
3.  The agent is configured with the necessary service account credentials to authenticate with Google Cloud.
4.  The agent can successfully publish a JSON-formatted message containing the metrics from Epic 1 to the `vm-status-topic`.

### Story 2.2: Basic Telegram Bot and Authentication

**As a developer, I want to create a basic, secure Telegram bot as a serverless function, so that it can serve as the user's command interface.**
*(Prerequisite: Story 2.1)*

#### Acceptance Criteria:

1.  A new Telegram bot is created and its token is securely stored.
2.  A Google Cloud Function is created to act as the bot's webhook endpoint.
3.  The bot correctly validates that incoming messages originate from a pre-configured, authorized Telegram Chat ID.
4.  Messages from unauthorized users are ignored and optionally logged for security monitoring.
5.  The bot responds to a `/start` or `/help` command with a simple message listing available commands.

### Story 2.3: Implement `/stats` Command

**As a user, I want to type `/stats` in Telegram and receive the latest metrics from my VM, so that I can check its status on demand.**
*(Prerequisite: Story 2.2)*

#### Acceptance Criteria:

1.  The bot subscribes to the `vm-status-topic` to receive metric updates from the agent.
2.  When the user sends the `/stats` command, the bot responds with the most recently received CPU usage, RAM usage, and last user input time.
3.  The response is formatted in a clear, human-readable way.
4.  If no metrics have been received from the agent yet, the bot responds with a message indicating the agent may be offline.

### Story 2.4: Implement `/shutdown` Command

**As a user, I want to type `/shutdown` in Telegram to gracefully shut down my VM, so that I can save costs when I'm away from my computer.**
*(Prerequisite: Story 2.3)*

#### Acceptance Criteria:

1.  When the bot receives a `/shutdown` command, it publishes a "shutdown" command message to the `vm-commands-topic`.
2.  The agent on the VM is subscribed to the `vm-commands-topic`.
3.  Upon receiving the "shutdown" message, the agent executes a graceful system shutdown command (e.g., `sudo shutdown now`).
4.  The bot sends a confirmation message to the user (e.g., "Shutdown command sent to VM Sentinel.").

---
## 8. Epic 3: Intelligent Idle Detection and Alerting

This final epic introduces the "intelligent" part of VM Sentinel. The objective is to implement the screenshot comparison logic and the idle timer, enabling the system to automatically detect when the VM is truly idle. This culminates in the system proactively notifying the user with an actionable alert, completing the full vision of the MVP.

### Story 3.1: Screenshot Capture

**As the system, I want to be able to capture a screenshot of the entire desktop, so that I have a visual representation of the screen state at a given moment.**
*(Prerequisite: Epic 1)*

#### Acceptance Criteria:

1.  The agent can successfully trigger a screenshot of the full desktop using the `scrot` command-line utility.
2.  The screenshot is saved to a temporary file path.
3.  The function to capture a screenshot is encapsulated in its own module.
4.  The agent cleans up (deletes) old screenshot files to avoid filling up the disk.

### Story 3.2: Screen Change Detection

**As the system, I want to compare two recent screenshots to determine if there has been a significant visual change, so that I can detect non-input-based activity (like a video playing).**
*(Prerequisite: Story 3.1)*

#### Acceptance Criteria:

1.  The agent captures a screenshot at a regular interval (e.g., every 15 seconds).
2.  The current screenshot is compared against the previous one.
3.  A "significant change" is registered if the difference between the two images exceeds a configurable threshold.
4.  A "last screen change" timestamp is updated whenever a significant change is detected.
5.  The comparison logic is reasonably efficient and does not cause a significant CPU spike.

### Story 3.3: Configurable Idle Timer

**As the system, I want to maintain a master idle timer based on all monitored signals, so that I can accurately determine when the VM is truly idle.**
*(Prerequisite: Story 3.2, Story 1.3)*

#### Acceptance Criteria:

1.  The agent's configuration includes a single, user-definable `idleTimeout` value (e.g., in minutes).
2.  The system is considered "active" if either the "last user input" timestamp OR the "last screen change" timestamp has been updated recently.
3.  The system is considered "idle" only when the time since BOTH the last input AND the last screen change exceeds the `idleTimeout`.
4.  The logic for checking the idle state is robust and clearly separated in the code.

### Story 3.4: Proactive Idle Alert Notification

**As the system, I want to send a proactive alert to the user via Telegram when the VM is determined to be idle, so that the user is notified and can take action.**
*(Prerequisite: Story 3.3, Epic 2)*

#### Acceptance Criteria:

1.  When the idle state is confirmed, the agent publishes a message to a specific Pub/Sub topic for alerts (e.g., `vm-alerts-topic`).
2.  The alert message payload includes the most recent screenshot image data.
3.  The bot backend subscribes to this topic.
4.  Upon receiving an alert message, the bot sends a message to the authorized user that includes the screenshot.
5.  The message text clearly states the VM appears to be idle and presents two buttons: "Shut Down" and "Ignore".

### Story 3.5: Handle Alert Responses

**As a user, I want to be able to tap the "Shut Down" or "Ignore" button on an idle alert, so that I can easily control the VM's state from the notification.**
*(Prerequisite: Story 3.4)*

#### Acceptance Criteria:

1.  When the user taps the "Shut Down" button, the bot triggers the existing shutdown workflow (identical to the `/shutdown` command).
2.  When the user taps the "Ignore" button, the bot sends a message back to the agent (via the `vm-commands-topic`) to reset the idle timer.
3.  Upon receiving the "ignore" command, the agent resets its idle timer and does not send another alert until the `idleTimeout` is exceeded again.
4.  The bot provides feedback to the user (e.g., "OK, I'll ignore it for now.") after a button is tapped.
