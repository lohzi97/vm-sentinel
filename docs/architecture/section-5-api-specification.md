# Section 5: API Specification

This project does not use a traditional synchronous API like REST or GraphQL. Instead, its "API" is defined by the combination of user-facing bot commands and the internal asynchronous message schemas used by Pub/Sub.

### 1. User Command API (via Telegram)
This is the API exposed to the end-user through the Telegram bot interface.

**Commands:**
- `/start`: Displays a welcome message and lists available commands.
- `/help`: Same as `/start`.
- `/stats`: Requests the latest metrics from the VM. The bot will respond with the data from the most recent `StatusMessage`.
- `/shutdown`: Initiates the shutdown sequence for the VM.

**Callback Queries (Buttons):**
- `shutdown`: Sent when the user presses the "Shut Down" button on an idle alert. Triggers the same workflow as the `/shutdown` command.
- `ignore`: Sent when the user presses the "Ignore" button. The bot sends a `CommandMessage` with the `reset_idle_timer` command to the agent.

### 2. Service-to-Service API (via Google Pub/Sub)
This is the internal API used for communication between the **VM Agent** and the **Bot Backend**. The specification for these API messages is defined by the TypeScript interfaces in the **Data Models** section above.

- **`StatusMessage`**: Sent from Agent to Bot.
- **`AlertMessage`**: Sent from Agent to Bot.
- **`CommandMessage`**: Sent from Bot to Agent.
