# 2. Requirements

## 2.1. Functional

*   **FR1:** The system must provide a VM agent that monitors CPU usage, RAM usage, and keyboard/mouse input to track user activity.
*   **FR2:** The VM agent must periodically capture and compare screenshots to detect visual changes on the screen as an indicator of activity.
*   **FR3:** The VM agent must trigger an idle alert only after a user-configurable period of inactivity has been met.
*   **FR4:** All communication between the VM agent and the backend bot must be securely handled via Google Cloud Pub/Sub.
*   **FR5:** The system must provide a Telegram bot to deliver idle alerts and process user commands.
*   **FR6:** The Telegram bot must accept and execute a `/shutdown` command to gracefully shut down the target VM.
*   **FR7:** The Telegram bot must accept and execute a `/stats` command to return on-demand system statistics from the VM.
*   **FR8:** The Telegram bot must validate that all incoming commands originate from a pre-authorized Telegram Chat ID.

## 2.2. Non-Functional

*   **NFR1:** The VM agent must be designed to run on Debian 12 ("Bookworm") with an XFCE desktop environment.
*   **NFR2:** The VM agent's baseline resource usage must not exceed 50MB of RAM and 2% average CPU utilization.
*   **NFR3:** The VM agent and Telegram bot backend must be developed using the Node.js (v18.x LTS or higher) runtime.
*   **NFR4:** For the MVP, system statistics must be logged to a local CSV file on the VM.
*   **NFR5:** The VM agent requires `scrot` and `xinput` to be pre-installed on the host operating system.
*   **NFR6:** The end-to-end setup process must be clearly documented and completable by a target user in under 15 minutes.

---