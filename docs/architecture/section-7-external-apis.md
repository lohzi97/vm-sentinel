# Section 7: External APIs

This project integrates with two primary external APIs: Google Cloud Pub/Sub for messaging and the Telegram Bot API for user interaction.

## Google Cloud Pub/Sub API
- **Purpose:** Provides the secure and reliable asynchronous messaging backbone that connects the VM Agent and the Bot Backend.
- **Documentation:** [cloud.google.com/pubsub/docs/reference/libraries](https://cloud.google.com/pubsub/docs/reference/libraries)
- **Base URL(s):** `pubsub.googleapis.com`
- **Authentication:** A GCP Service Account key file (`.json`) is used by the VM Agent. The Bot Backend (Cloud Function) uses the intrinsic service account identity provided by the execution environment.
- **Rate Limits:** Extremely generous limits that are not a practical concern for this single-user application.

**Key Endpoints Used:**
This API is consumed via the `@google-cloud/pubsub` Node.js client library, not direct REST calls. The primary methods are:
- `topic.publishMessage()`: Used by both Agent and Bot to send messages.
- `subscription.on('message', ...)`: Used by both Agent and Bot to process incoming messages.

**Integration Notes:** The client library handles all the complexities of authentication, message batching, and retry logic.

## Telegram Bot API
- **Purpose:** Allows our Bot Backend to send messages to the user and receive their commands.
- **Documentation:** [core.telegram.org/bots/api](https://core.telegram.org/bots/api)
- **Base URL(s):** `api.telegram.org`
- **Authentication:** A secret Bot Token obtained from Telegram's "BotFather". This token is provided in the HTTP requests to the API.
- **Rate Limits:** The API has rate limits (e.g., max 30 messages/sec) which are far beyond the needs of this application.

**Key Endpoints Used:**
- `POST /setWebhook`: Used once during setup to tell Telegram where to send user messages.
- `POST /sendMessage`: Used to send text-based messages (e.g., `/stats` response, confirmations).
- `POST /sendPhoto`: Used to send the idle alert, which includes a screenshot.

**Integration Notes:** We will use a library like `telegraf` to simplify interactions with the Telegram API, handling the details of webhook processing and formatting requests.
