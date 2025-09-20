# 3. User Interface Design Goals

## 3.1. Overall UX Vision

The user experience will be a minimal, text-based conversational interface delivered via Telegram. The vision is to provide an "easy to turn off" utility that feels as simple and immediate as sending a text message. The UI should be fast, reliable, and require no learning curve for a user familiar with basic bot commands.

## 3.2. Key Interaction Paradigms

The primary interaction paradigm is a command-driven chatbot. Users will interact with the system by issuing explicit slash commands (e.g., `/shutdown`, `/stats`). The bot will respond with concise, informative messages. The only proactive interaction from the bot will be the critical idle-state notification.

## 3.3. Core Screens and Views

In the context of the Telegram bot, "screens" are the key messages the user will see:

*   **Idle Alert Message:** A notification message containing a current screenshot of the VM, key stats (CPU, RAM), and clear "Shutdown" and "Ignore" action buttons.
*   **`/stats` Response:** A message displaying the current CPU usage, RAM usage, and other relevant system metrics.
*   **`/shutdown` Confirmation:** A simple confirmation message acknowledging that the shutdown command has been received and is being executed.
*   **Help/Welcome Message:** A message outlining the available commands and their function, sent when a user first interacts with the bot or requests help.

## 3.4. Accessibility: None

For the MVP, no specific accessibility requirements beyond the native features of the Telegram client are in scope. The interface is purely text-and-button-based, making it inherently compatible with screen readers.

## 3.5. Branding

There are no specific branding or style guide requirements for the MVP.

## 3.6. Target Device and Platforms: Cross-Platform

The interface is Telegram, which is accessible across all platforms supported by the Telegram client (iOS, Android, Web, Desktop).

---