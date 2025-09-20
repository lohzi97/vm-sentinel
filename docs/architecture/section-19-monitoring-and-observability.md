# Section 19: Monitoring and Observability

### Monitoring Stack
- **Bot Backend Monitoring:** **Google Cloud Operations Suite**
  - **Cloud Logging:** All structured logs from the `pino` logger will be sent here, allowing for powerful searching and analysis.
  - **Cloud Monitoring:** Provides out-of-the-box dashboards for the Cloud Function, tracking invocations, execution time, and error rates.
  - **Cloud Error Reporting:** Automatically aggregates and displays errors caught by Cloud Logging for easy tracking.

- **VM Agent Monitoring:** **Heartbeat via Pub/Sub**
  - The agent already publishes a `StatusMessage` at a regular interval. We will treat this as a **heartbeat**.
  - We will set up a **Google Cloud Monitoring Alert** that triggers if no message is received on the `vm-status-topic` for a configurable period (e.g., 15 minutes). This indicates that the agent is offline or has lost connectivity.

### Key Metrics to Watch

**Bot Backend Metrics (via Cloud Monitoring):**
- **Function Invocation Count:** To understand usage patterns.
- **Execution Duration (p95):** To monitor the bot's responsiveness and identify slow-downs or high cold-start times.
- **Error Rate:** The percentage of invocations that fail. A spike here indicates a problem.

**VM Agent Metrics:**
- **Heartbeat (via Cloud Monitoring Alert):** The most critical metric. If the heartbeat stops, the agent is down.
- **CPU / RAM Usage (logged in `metrics.csv`):** To ensure the agent is meeting its performance NFRs.
- **Pub/Sub Publish Errors (logged locally):** To track connectivity issues from the agent's side.
