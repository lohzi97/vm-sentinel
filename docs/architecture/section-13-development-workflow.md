# Section 13: Development Workflow

### Local Development Setup

**Prerequisites:**
You must have the following tools installed on your system.
```bash
# Node.js (v18.x or higher) and npm (v9.x or higher)
# On the VM where the agent will run (Debian/Ubuntu):
```
```bash
sudo apt-get update && sudo apt-get install -y scrot xinput
```

**Initial Setup:**
These commands will clone the repository and install all dependencies for all workspaces.
```bash
git clone <repository_url>
cd vm-sentinel
npm install
```

**Development Commands:**
These commands are run from the root of the monorepo.
```bash
# Start both the bot and agent in development mode
npm run dev

# Start only the bot backend
npm run dev --workspace=bot

# Start only the VM agent
npm run dev --workspace=agent

# Run tests across the entire project
npm test --workspaces

# Lint all packages
npm run lint --workspaces
```

### Environment Configuration
You will need to create a `.env` file for the bot and a `config.json` for the agent. Use `.env.example` as a template.

**Required Environment Variables (`apps/bot/.env`):**
```bash
# .env file for the Bot Backend
TELEGRAM_BOT_TOKEN="your_secret_token_from_botfather"
TELEGRAM_AUTHORIZED_CHAT_ID="your_personal_telegram_chat_id"

GCP_PROJECT_ID="your-gcp-project-id"

# Pub/Sub Topic/Subscription names
GCP_PUB_SUB_COMMANDS_TOPIC="vm-commands-topic"
GCP_PUB_SUB_STATUS_SUBSCRIPTION="vm-status-subscription"
GCP_PUB_SUB_ALERTS_SUBSCRIPTION="vm-alerts-subscription"
```

**Required Configuration (`apps/agent/config.json`):**
The agent uses a JSON file for configuration instead of environment variables.
```json
{
  "gcp_project_id": "your-gcp-project-id",
  "gcp_keyfile_path": "/path/to/your/gcp-service-account.json",
  "telegram_authorized_chat_id": "your_personal_telegram_chat_id",
  "monitoring_interval_ms": 5000,
  "idle_timeout_minutes": 20,
  "screenshot_comparison_threshold": 0.1
}
```
