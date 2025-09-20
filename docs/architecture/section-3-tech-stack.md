# Section 3: Tech Stack

### Technology Stack Table
| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Language | Telegram UI | N/A | User Interface | The UI is rendered by the native Telegram client. |
| Frontend Framework | Telegram Bot API | N/A | UI Interaction | All user interactions are handled via bot commands and buttons. |
| UI Component Library | N/A | N/A | N/A | N/A |
| State Management | N/A | N/A | N/A | N/A |
| Backend Language | Node.js | 18.x LTS | Agent & Bot Runtime | Specified in PRD (NFR3) for its event-driven nature and large ecosystem. |
| Backend Framework | Express.js | 4.x | Bot Webhook Handler | Lightweight, unopinionated framework ideal for wrapping a simple Cloud Function. |
| API Style | Async Messaging | N/A | Decoupled Communication | Using Google Pub/Sub topics (`vm-status`, `vm-alerts`, `vm-commands`). |
| Database | Local CSV File | N/A | MVP Metric Storage | As per PRD (NFR4), avoids database setup overhead for the MVP. |
| Cache | N/A | N/A | N/A | No caching is required for the MVP's functionality. |
| File Storage | Local VM Filesystem | N/A | Screenshot/Log Storage | Screenshots and logs are stored on the VM before processing or cleanup. |
| Authentication | Telegram Chat ID | N/A | Secure User Validation | Simple, effective security model for a single-user tool, as per PRD (FR8). |
| Backend Testing | Jest | 29.x | Unit & Integration Tests | Popular, well-supported testing framework in the Node.js ecosystem. |
| E2E Testing | TBD | N/A | Full System Validation | Not in scope for MVP, but could be explored later if needed. |
| Build Tool | npm scripts | 9.x+ | Task Automation | Standard for Node.js projects to run build, test, and lint commands. |
| Bundler | esbuild | 0.19.x | Cloud Function Bundling | Extremely fast bundler to optimize the bot's cold start time and package size. |
| IaC Tool | Manual Setup | N/A | Infrastructure Provisioning | Initial setup will be manual via GCP Console, as per docs. Can be automated later. |
| CI/CD | GitHub Actions | N/A | Continuous Integration | Industry standard for automating testing and linting on each commit. |
| Monitoring | Google Cloud Ops | N/A | Backend Observability | Provides logging and metrics for Cloud Functions and Pub/Sub out-of-the-box. |
| Logging | pino | 8.x | Structured Logging | High-performance logger for creating structured, parseable logs. |
| CSS Framework | N/A | N/A | N/A | N/A |
