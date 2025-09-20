# Section 14: Deployment Architecture

### Deployment Strategy

**Bot Backend Deployment:**
- **Platform:** Google Cloud Functions
- **Build Command:** `npm run build --workspace=bot`
- **Deployment Method:** The application is deployed using the `gcloud` command-line tool. The command will bundle the code and configure the function, including setting environment variables.
    ```bash
    # Example deployment command
    gcloud functions deploy telegramWebhook \
      --runtime nodejs18 \
      --trigger-http \
      --entry-point telegramWebhook \
      --source apps/bot/dist \
      --env-vars-file apps/bot/.env.yaml
    ```

**VM Agent Deployment:**
- **Platform:** User's Debian Virtual Machine
- **Build Command:** `npm run build --workspace=agent`
- **Deployment Method:** Deployment is a manual process performed by the user on their VM. A process manager like `pm2` is recommended to keep the agent running continuously.
    ```bash
    # Example deployment steps on the VM
    git pull origin main
    npm install
    npm run build --workspace=agent
    
    # Start or restart the agent with pm2
    pm2 start apps/agent/dist/index.js --name vm-sentinel-agent --restart-delay 5000
    pm2 save # Saves the process list to restart on reboot
    ```

### CI/CD Pipeline
For the MVP, we will implement a Continuous Integration (CI) pipeline using GitHub Actions to automate code quality checks. Continuous Deployment (CD) will remain a manual process.

**`/.github/workflows/ci.yaml`:**
```yaml
name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js 18.x
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm install
        
      - name: Run Linter
        run: npm run lint --workspaces --if-present
        
      - name: Run Tests
        run: npm test --workspaces --if-present

  # CD jobs (e.g., deploying the bot to GCP) would be added here later.
```

### Environments
| Environment | Bot URL | Agent Location | Purpose |
| :--- | :--- | :--- | :--- |
| Development | `localhost:8080` | Local Machine | Local development and testing. |
| Staging | N/A | N/A | No pre-production environment for this MVP. |
| Production | GCP Function URL | User's VM | Live, operational environment. |
