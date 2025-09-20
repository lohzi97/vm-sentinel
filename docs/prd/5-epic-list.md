# 5. Epic List

*   **Epic 1: Foundational Monitoring Agent:** Establish the project foundation and create a VM agent capable of monitoring system metrics (CPU, RAM, input) and logging them locally.
*   **Epic 2: Remote Control via Telegram:** Implement the Telegram bot and secure cloud communication layer (Pub/Sub) to enable remote VM shutdown and statistics retrieval with `/shutdown` and `/stats` commands.
*   **Epic 3: Intelligent Idle Detection and Alerting:** Introduce screenshot comparison logic and a configurable timer to the agent to intelligently detect an idle state and proactively alert the user via Telegram.

---