# Section 10: Frontend Architecture

For this project, the "frontend" is the user's native Telegram client. Therefore, traditional web frontend architecture concepts are mapped to their equivalents in a conversational bot context. The architecture is focused on the design of the bot's interactions and messages.

### Component Architecture
The bot's "components" are the distinct, reusable messages it constructs and sends to the user.

**Component Organization:**
- `WelcomeMessage`: Sent in response to `/start` or `/help`.
- `StatsResponseMessage`: Sent in response to `/stats`.
- `ShutdownConfirmationMessage`: Sent after a shutdown command is acknowledged.
- `IdleAlertMessage`: The proactive alert with a screenshot and action buttons.
- `FeedbackMessage`: Simple confirmations like "OK, I'll ignore it for now."

**Component Template (Example):**
This is a conceptual example of a function that builds the `StatsResponseMessage`.
```typescript
function createStatsMessage(metrics: StatusMessage): string {
  return `
📊 **VM Status**
- **CPU Usage:** ${metrics.cpu_usage.toFixed(1)}%
- **RAM Usage:** ${metrics.ram_usage.toFixed(1)}%
- **Last User Input:** ${new Date(metrics.last_input_timestamp).toLocaleString()}
  `;
}
```

### State Management Architecture
The bot backend (Cloud Function) is **stateless**. This is a critical design principle for scalability and simplicity.
- **State Structure:** No user or session state is stored in the bot backend itself.
- **State Location:**
    1.  **VM State:** The true state of the system (e.g., `last_input_timestamp`) is maintained by the **VM Agent**.
    2.  **Conversation State:** The chat history is the state, managed by Telegram. The bot simply responds to the latest message.

### Routing Architecture
"Routing" is the process of parsing incoming user messages to determine which action to take.

**Route Organization:**
A simple router or `switch` statement in the main webhook handler will parse the command from the message text.
```typescript
// Conceptual routing
const command = message.text.split(' ')[0]; // e.g., '/stats'
switch (command) {
  case '/start':
    // handleStartCommand();
    break;
  case '/stats':
    // handleStatsCommand();
    break;
  // ...etc.
}
```

**Protected Route Pattern:**
The entire bot is "protected." The very first step in the webhook handler is to validate the user's `chat.id`. If it does not match the authorized ID from the configuration, the function terminates immediately. This acts as a global authentication guard.

### Frontend Services Layer
This layer is responsible for communication with the Telegram Bot API.

**API Client Setup:**
We will use the `telegraf` library, as specified in the Tech Stack. It will be initialized with the bot token.
```typescript
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

**Service Example:**
`telegraf` provides a simple, declarative way to define command handlers, which encapsulates the service logic.
```typescript
// Telegraf handles routing and the service call
bot.command('stats', async (ctx) => {
  // 1. Logic to get latest stats from Pub/Sub subscription
  const latestMetrics = await getLatestMetrics(); 
  
  // 2. Create the message component
  const message = createStatsMessage(latestMetrics);

  // 3. Reply to the user (service call to Telegram API)
  await ctx.reply(message, { parse_mode: 'MarkdownV2' });
});
```
