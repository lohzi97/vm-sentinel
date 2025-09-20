# 8. Epic 3: Intelligent Idle Detection and Alerting

This final epic introduces the "intelligent" part of VM Sentinel. The objective is to implement the screenshot comparison logic and the idle timer, enabling the system to automatically detect when the VM is truly idle. This culminates in the system proactively notifying the user with an actionable alert, completing the full vision of the MVP.

## Story 3.1: Screenshot Capture

**As the system, I want to be able to capture a screenshot of the entire desktop, so that I have a visual representation of the screen state at a given moment.**
*(Prerequisite: Epic 1)*

### Acceptance Criteria:

1.  The agent can successfully trigger a screenshot of the full desktop using the `scrot` command-line utility.
2.  The screenshot is saved to a temporary file path.
3.  The function to capture a screenshot is encapsulated in its own module.
4.  The agent cleans up (deletes) old screenshot files to avoid filling up the disk.

## Story 3.2: Screen Change Detection

**As the system, I want to compare two recent screenshots to determine if there has been a significant visual change, so that I can detect non-input-based activity (like a video playing).**
*(Prerequisite: Story 3.1)*

### Acceptance Criteria:

1.  The agent captures a screenshot at a regular interval (e.g., every 15 seconds).
2.  The current screenshot is compared against the previous one.
3.  A "significant change" is registered if the difference between the two images exceeds a configurable threshold.
4.  A "last screen change" timestamp is updated whenever a significant change is detected.
5.  The comparison logic is reasonably efficient and does not cause a significant CPU spike.

## Story 3.3: Configurable Idle Timer

**As the system, I want to maintain a master idle timer based on all monitored signals, so that I can accurately determine when the VM is truly idle.**
*(Prerequisite: Story 3.2, Story 1.3)*

### Acceptance Criteria:

1.  The agent's configuration includes a single, user-definable `idleTimeout` value (e.g., in minutes).
2.  The system is considered "active" if either the "last user input" timestamp OR the "last screen change" timestamp has been updated recently.
3.  The system is considered "idle" only when the time since BOTH the last input AND the last screen change exceeds the `idleTimeout`.
4.  The logic for checking the idle state is robust and clearly separated in the code.

## Story 3.4: Proactive Idle Alert Notification

**As the system, I want to send a proactive alert to the user via Telegram when the VM is determined to be idle, so that the user is notified and can take action.**
*(Prerequisite: Story 3.3, Epic 2)*

### Acceptance Criteria:

1.  When the idle state is confirmed, the agent publishes a message to a specific Pub/Sub topic for alerts (e.g., `vm-alerts-topic`).
2.  The alert message payload includes the most recent screenshot image data.
3.  The bot backend subscribes to this topic.
4.  Upon receiving an alert message, the bot sends a message to the authorized user that includes the screenshot.
5.  The message text clearly states the VM appears to be idle and presents two buttons: "Shut Down" and "Ignore".

## Story 3.5: Handle Alert Responses

**As a user, I want to be able to tap the "Shut Down" or "Ignore" button on an idle alert, so that I can easily control the VM's state from the notification.**
*(Prerequisite: Story 3.4)*

### Acceptance Criteria:

1.  When the user taps the "Shut Down" button, the bot triggers the existing shutdown workflow (identical to the `/shutdown` command).
2.  When the user taps the "Ignore" button, the bot sends a message back to the agent (via the `vm-commands-topic`) to reset the idle timer.
3.  Upon receiving the "ignore" command, the agent resets its idle timer and does not send another alert until the `idleTimeout` is exceeded again.
4.  The bot provides feedback to the user (e.g., "OK, I'll ignore it for now.") after a button is tapped.
