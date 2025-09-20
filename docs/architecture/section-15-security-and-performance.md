# Section 15: Security and Performance

### Security Requirements

**Bot Backend Security:**
- **Input Validation:** All incoming messages and callbacks from Telegram must be strictly validated. The primary security gate is ensuring the `chat.id` of every incoming message matches the `TELEGRAM_AUTHORIZED_CHAT_ID` environment variable. Any non-matching request must be terminated immediately.
- **Secret Management:** The `TELEGRAM_BOT_TOKEN` and other secrets must be stored as environment variables in the Google Cloud Function, not hardcoded in the source.

**VM Agent Security:**
- **Command Injection Prevention:** This is the most critical security concern for the agent. The agent **MUST NOT** execute arbitrary strings received from the `CommandMessage`. It must use a strict `switch` statement on the `command` property to map predefined commands (e.g., `'shutdown'`) to hardcoded, safe system calls (e.g., `exec('sudo shutdown now')`).
- **Credential Security:** The GCP service account key file stored on the VM must have its file permissions restricted to be readable only by the user running the agent process (e.g., `chmod 400 /path/to/key.json`).

**Authentication Security:**
- **Authentication Model:** The entire system's authentication relies on the secrecy of the Telegram Bot Token and the validation of the user's Chat ID. This is a simple but effective "shared secret" model suitable for a single-user application.
- **Statelessness:** The bot backend is stateless and does not manage sessions, which eliminates all session-based attack vectors (e.g., session hijacking).

### Performance Optimization

**Bot Backend Performance:**
- **Response Time Target:** Simple command acknowledgements should respond in `< 500ms`.
- **Cold Start Optimization:** The primary strategy is to use `esbuild` to bundle the application into a small, single JavaScript file. This significantly reduces the initialization time for the Google Cloud Function, minimizing latency for the first request after a period of inactivity.

**VM Agent Performance:**
- **Resource Usage Target:** The agent must adhere to the non-functional requirement of using less than **50MB of RAM** and **2% average CPU utilization**.
- **Efficient Polling:** The `monitoring_interval_ms` must be carefully balanced. Polling too frequently will waste CPU; too slowly, and the data will not be useful.
- **Image Comparison:** The screenshot comparison logic must be efficient. It should operate on downscaled thumbnails if possible and use performant image processing libraries to avoid CPU spikes.
