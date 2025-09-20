# Section 4: Data Models

## Model: `AgentConfig`
**Purpose:** Defines the local configuration for the VM agent. This file is managed by the user and read by the agent on startup.

**Key Attributes:**
- `gcp_project_id`: `string` - The Google Cloud project ID.
- `gcp_keyfile_path`: `string` - Absolute path to the GCP service account key file.
- `telegram_authorized_chat_id`: `string` - The user's Telegram Chat ID to authorize commands.
- `monitoring_interval_ms`: `number` - How often to poll for system metrics.
- `idle_timeout_minutes`: `number` - Minutes of inactivity before triggering an idle alert.
- `screenshot_comparison_threshold`: `number` - The percentage of pixel difference required to register a screen change.

### TypeScript Interface
```typescript
interface AgentConfig {
  gcp_project_id: string;
  gcp_keyfile_path: string;
  telegram_authorized_chat_id: string;
  monitoring_interval_ms: number;
  idle_timeout_minutes: number;
  screenshot_comparison_threshold: number;
}
```
### Relationships
- This interface defines the structure of the `config.json` file read by the **VM Agent**.

## Model: `StatusMessage`
**Purpose:** Transports periodic system metrics from the agent to the cloud. This data is used for the `/stats` command.

**Key Attributes:**
- `timestamp`: `string` - ISO 8601 timestamp of when the metrics were captured.
- `cpu_usage`: `number` - Current CPU utilization percentage.
- `ram_usage`: `number` - Current RAM usage percentage.
- `last_input_timestamp`: `string` - ISO 8601 timestamp of the last detected user input.

### TypeScript Interface
```typescript
interface StatusMessage {
  timestamp: string;
  cpu_usage: number;
  ram_usage: number;
  last_input_timestamp: string;
}
```
### Relationships
- Published by the **VM Agent** to the `vm-status-topic`.
- Consumed by the **Bot Backend** to respond to the `/stats` command.

## Model: `AlertMessage`
**Purpose:** Notifies the bot that the VM has entered an idle state. It includes a screenshot for the user to have visual context.

**Key Attributes:**
- `timestamp`: `string` - ISO 8601 timestamp of when the idle state was confirmed.
- `screenshot_base64`: `string` - A base64-encoded string of the captured screenshot (JPEG or PNG).
- `cpu_usage`: `number` - CPU utilization at the time of the alert.
- `ram_usage`: `number` - RAM usage at the time of the alert.

### TypeScript Interface
```typescript
interface AlertMessage {
  timestamp: string;
  screenshot_base64: string;
  cpu_usage: number;
  ram_usage: number;
}
```
### Relationships
- Published by the **VM Agent** to the `vm-alerts-topic`.
- Consumed by the **Bot Backend** to generate and send the proactive alert to the user.

## Model: `CommandMessage`
**Purpose:** Sends control instructions from the bot back down to the agent on the VM.

**Key Attributes:**
- `command`: `'shutdown' | 'reset_idle_timer'` - A string literal defining the specific action for the agent to take.

### TypeScript Interface
```typescript
interface CommandMessage {
  command: 'shutdown' | 'reset_idle_timer';
}
```
### Relationships
- Published by the **Bot Backend** to the `vm-commands-topic`.
- Consumed by the **VM Agent** to execute the requested action (e.g., initiate shutdown).
