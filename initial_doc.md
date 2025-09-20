VM Sentinel
1. High-Level Overview
System Architecture
VM Sentinel is an intelligent virtual machine (VM) monitoring system that automatically detects idle states and enables remote shutdown via Telegram commands. It runs on Debian 12 with XFCE and operates through three main components:
🖥️ VM Agent (Node.js Application)  

Continuously monitors system resources, user activity, and GUI state  
Captures screenshots and tracks input activity  
Publishes idle notifications and system stats to Google Cloud Pub/Sub  
Subscribes to command messages for remote operations

☁️ Cloud Communication Layer (Google Pub/Sub)  

Provides asynchronous, reliable messaging between components  
Decouples the VM agent from the Telegram bot infrastructure  
Enables secure command transmission and status updates

🤖 Telegram Bot Interface (Cloud Function)  

Receives user commands via Telegram webhook  
Processes /shutdown and /stats commands  
Publishes commands to Pub/Sub for VM execution  
Validates commands against authorized Telegram Chat IDs

Workflow Process

Continuous Monitoring: VM agent runs as a systemd service, checking every minute for:  

CPU usage below threshold (e.g., <10%)  
RAM usage below threshold (e.g., <15%)  
No user input detected (keyboard/mouse)  
GUI state unchanged (screenshot comparison)


Idle Detection: When all conditions are met for 60 minutes (configurable), the agent:  

Captures a current screenshot  
Collects system statistics  
Sends notification via Pub/Sub with all data


User Notification: Cloud Function processes idle notifications and:  

Formats a rich message with system stats  
Attaches the current screenshot  
Sends to user's Telegram chat with shutdown confirmation request


Remote Commands: Users can send:  

/stats - Immediate system status and screenshot  
/shutdown - Graceful VM shutdown after confirmation  
Commands are validated against a list of authorized Chat IDs and processed via Pub/Sub



Key Benefits

Automated Resource Management: Prevents unnecessary cloud costs from idle VMs  
Remote Accessibility: Control VMs from anywhere via Telegram  
Production Ready: Robust error handling, logging, and service management  
Secure Communication: Commands go through authenticated Google Cloud services  
Lightweight: Minimal resource usage with CSV-based stats logging


2. Technical Specification
System Requirements

Operating System: Debian 12 (Bookworm) with XFCE desktop environment  
Node.js: Latest LTS version (18.x or higher)  
System Tools: scrot, xinput, standard Linux utilities  
Google Cloud: Project with Pub/Sub API enabled  
Network: Internet connectivity for Telegram API and GCP services

Architecture Components
VM Agent (index.js)
┌─────────────────────────────────────┐
│           VM Agent Process          │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     Monitoring Loop (1min)     │ │
│ │  • CPU/RAM check               │ │
│ │  • Input activity detection    │ │
│ │  • Screenshot comparison       │ │
│ │  • Idle timer management       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │    Pub/Sub Communication       │ │
│ │  • Publisher (stats/alerts)    │ │
│ │  • Subscriber (commands)       │ │
│ │  • Message handling/retry      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │    System Operations            │ │
│ │  • Screenshot capture          │ │
│ │  • Input monitoring            │ │
│ │  • Shutdown execution          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Telegram Bot (Cloud Function)
const { Telegraf } = require('telegraf');
const { PubSub } = require('@google-cloud/pubsub');

exports.telegramBot = async (req, res) => {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT_ID });
  const authorizedChatIds = process.env.TELEGRAM_AUTH_CHAT_IDS.split(',');

  // Handle Telegram webhook
  bot.on('message', async (ctx) => {
    if (!authorizedChatIds.includes(ctx.chat.id.toString())) {
      await ctx.reply('Unauthorized user');
      return;
    }
    if (ctx.message.text === '/stats') {
      await pubsub.topic(process.env.PUBSUB_TOPIC_BOT_TO_AGENT).publishJSON({
        type: 'command',
        action: 'stats',
        user_id: ctx.from.id,
        timestamp: new Date().toISOString(),
      });
    } else if (ctx.message.text === '/shutdown') {
      await pubsub.topic(process.env.PUBSUB_TOPIC_BOT_TO_AGENT).publishJSON({
        type: 'command',
        action: 'shutdown',
        user_id: ctx.from.id,
        timestamp: new Date().toISOString(),
        confirmation_required: true,
      });
    }
  });

  // Process webhook request
  await bot.handleUpdate(req.body);
  res.status(200).send('OK');
};

Configuration Schema (config.js)
const validateRequired = (value, name) => {
  if (!value) throw new Error(`${name} is required`);
  return value;
};

module.exports = {
  telegram: {
    botToken: validateRequired(process.env.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN'),
    chatId: validateRequired(process.env.TELEGRAM_CHAT_ID, 'TELEGRAM_CHAT_ID'),
    authChatIds: validateRequired(process.env.TELEGRAM_AUTH_CHAT_IDS, 'TELEGRAM_AUTH_CHAT_IDS').split(','),
  },
  monitoring: {
    idleDurationMinutes: parseInt(process.env.IDLE_DURATION_MINUTES) || 60,
    cpuThresholdPercent: parseFloat(process.env.CPU_THRESHOLD_PERCENT) || 10,
    ramThresholdPercent: parseFloat(process.env.RAM_THRESHOLD_PERCENT) || 15,
    screenshotIntervalMs: parseInt(process.env.SCREENSHOT_INTERVAL_MS) || 300000,
    checkIntervalMs: parseInt(process.env.CHECK_INTERVAL_MS) || 60000,
  },
  gcp: {
    projectId: validateRequired(process.env.GCP_PROJECT_ID, 'GCP_PROJECT_ID'),
    topicAgentToBot: validateRequired(process.env.PUBSUB_TOPIC_AGENT_TO_BOT, 'PUBSUB_TOPIC_AGENT_TO_BOT'),
    topicBotToAgent: validateRequired(process.env.PUBSUB_TOPIC_BOT_TO_AGENT, 'PUBSUB_TOPIC_BOT_TO_AGENT'),
    subscriptionBotToAgent: validateRequired(process.env.PUBSUB_SUBSCRIPTION_BOT_TO_AGENT, 'PUBSUB_SUBSCRIPTION_BOT_TO_AGENT'),
  },
  system: {
    screenshotPath: process.env.SCREENSHOT_PATH || '/tmp/vm-screenshots',
    logLevel: process.env.LOG_LEVEL || 'info',
    statsLogPath: process.env.STATS_LOG_PATH || '/var/log/vm-stats.csv',
  },
};

Data Flow Specifications
Message Schemas
Idle Notification Message
{
  "type": "idle_detected",
  "timestamp": "2025-09-14T10:30:00Z",
  "duration_minutes": 65,
  "system_stats": {
    "cpu_usage": 3.2,
    "ram_usage": 12.8,
    "uptime_hours": 147.5,
    "disk_usage": 45.3
  },
  "screenshot_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "hostname": "vm-instance-01"
}

Command Message
{
  "type": "command",
  "action": "shutdown|stats",
  "user_id": "123456789",
  "timestamp": "2025-09-14T10:35:00Z",
  "confirmation_required": true
}

Stats Response Message
{
  "type": "stats_response",
  "timestamp": "2025-09-14T10:35:30Z",
  "system_stats": {
    "cpu_usage": 8.1,
    "ram_usage": 18.4,
    "uptime_hours": 147.6,
    "disk_usage": 45.3
  },
  "screenshot_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "idle_status": {
    "is_idle": false,
    "idle_duration_minutes": 0,
    "last_activity_timestamp": "2025-09-14T10:34:45Z"
  }
}

Technology Stack Details
Core Dependencies
{
  "runtime": "node:18-alpine",
  "dependencies": {
    "telegraf": "^4.12.2",
    "systeminformation": "^5.21.8",
    "@google-cloud/pubsub": "^4.0.7",
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "sharp": "^0.32.5"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "eslint": "^8.50.0",
    "eslint-config-airbnb-base": "^15.0.0"
  }
}

System Integration
# Install system packages
apt-get update && apt-get install -y scrot xinput imagemagick

# Deploy Cloud Function
gcloud functions deploy telegramBot \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source ./cloud-function \
  --set-env-vars TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},GCP_PROJECT_ID=${GCP_PROJECT_ID},...

# Service management
systemctl enable vm-sentinel
systemctl start vm-sentinel

# Log management
journalctl -u vm-sentinel -f

Performance Specifications
Resource Usage

Memory: <50MB baseline, <100MB with screenshot processing  
CPU: <2% average, <10% during screenshot capture/comparison  
Network: <1KB/min baseline, ~50-500KB per screenshot transmission  
Storage: <10MB for logs and temporary screenshots, CSV stats logged daily

Monitoring Intervals

System Check: Every 60 seconds  
Screenshot Capture: Every 5 minutes (configurable)  
Input Monitoring: Continuous via event listeners  
Pub/Sub Polling: 10-second intervals with exponential backoff

Error Handling & Resilience

Retry Logic: 3 attempts with exponential backoff for external calls  
Circuit Breaker: Disables features if failures exceed threshold  
Graceful Degradation: Continues monitoring if screenshot/input fails  
Health Checks: Self-monitoring with automatic restarts

Security Considerations
Authentication & Authorization

Telegram bot token stored in environment variables  
Commands validated against TELEGRAM_AUTH_CHAT_IDS (comma-separated list)  
GCP service account with minimal permissions (Pub/Sub only)  
No sensitive data logged or transmitted in plain text

Data Privacy

Screenshots transmitted via secure HTTPS  
Temporary files cleaned up after transmission  
Configurable data retention for logs and CSV stats


3. Detailed AI Agent Prompt
Project Context
Implement a production-ready VM idle monitoring and remote shutdown system named VM Sentinel. This Node.js application runs as a systemd service on a Debian 12 VM with XFCE, accessed via Chrome Remote Desktop.
Technical Requirements
Environment Setup

Target Platform: Debian GNU/Linux 12 (bookworm) with XFCE  
Node.js Version: Latest LTS (18.x+)  
Access Method: Chrome Remote Desktop (GUI always available)  
Service Type: systemd service with auto-restart  
Required Tools: scrot (screenshot), xinput (input monitoring)

Project Structure
vm-sentinel/
├── package.json
├── index.js
├── config.js
├── lib/
│   ├── monitor.js
│   ├── screenshot.js
│   ├── input.js
│   ├── pubsub.js
│   ├── telegram.js
│   ├── analytics.js
├── cloud-function/
│   ├── index.js
├── .env.example
├── vm-sentinel.service
└── README.md

Core Functionality Implementation
1. System Monitoring (lib/monitor.js)
class SystemMonitor {
  async getCPUUsage() {}     // Return CPU percentage
  async getRAMUsage() {}     // Return RAM percentage
  async getDiskUsage() {}    // Return disk usage
  async getSystemUptime() {} // Return uptime in hours
}

2. Screenshot Management (lib/screenshot.js)
class ScreenshotManager {
  async captureScreenshot() {}        // Use 'scrot /tmp/screenshot.png'
  async compareScreenshots(img1, img2) {} // Hash-based comparison
  async getScreenshotHash(buffer) {}  // Generate SHA256 hash
  cleanup() {}                        // Remove temporary files
}

3. Input Detection (lib/input.js)
class InputMonitor {
  startMonitoring() {}        // Begin input monitoring
  stopMonitoring() {}         // Clean shutdown
  getLastActivityTime() {}    // Return last input timestamp
  getIdleTime() {}           // Calculate idle duration
}

4. Pub/Sub Integration (lib/pubsub.js)
class PubSubManager {
  constructor(projectId, credentials) {}
  async publishIdleNotification(systemStats, screenshot) {}
  async publishStatsResponse(systemStats, screenshot) {}
  async subscribeToCommands(callback) {}
  async handleCommandMessage(message) {}
  async initialize() {}
  async shutdown() {}
}

5. Stats Logging (lib/analytics.js)
const fs = require('fs').promises;

class StatsLogger {
  async logStats(stats) {
    const csv = `${stats.timestamp},${stats.hostname},${stats.system.cpu_usage},` +
                `${stats.system.ram_usage},${stats.system.disk_usage},${stats.system.uptime_hours},` +
                `${stats.idle_tracking.is_idle},${stats.idle_tracking.idle_duration_minutes},` +
                `${stats.idle_tracking.last_activity_timestamp}\n`;
    await fs.appendFile(config.system.statsLogPath, csv);
  }
}

6. Main Application Logic (index.js)
class VMSentinel {
  constructor(config) {}
  async start() {}            // Initialize components
  async stop() {}             // Graceful shutdown
  async checkIdleConditions() {} // Evaluate idle criteria
  async handleIdleDetected() {}  // Process idle state
  async handleCommandReceived() {} // Process commands
  async resetIdleTimer() {}     // Reset on activity
  async monitoringLoop() {}     // 60-second check cycle
}

Configuration Requirements (config.js)
Environment Variables (.env)
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_AUTH_CHAT_IDS=chat_id_1,chat_id_2

# Monitoring Thresholds
IDLE_DURATION_MINUTES=60
CPU_THRESHOLD_PERCENT=10
RAM_THRESHOLD_PERCENT=15
SCREENSHOT_INTERVAL_MS=300000
CHECK_INTERVAL_MS=60000

# Google Cloud Configuration
GCP_PROJECT_ID=your-gcp-project-id
PUBSUB_TOPIC_AGENT_TO_BOT=vm-to-bot-topic
PUBSUB_TOPIC_BOT_TO_AGENT=bot-to-vm-topic
PUBSUB_SUBSCRIPTION_BOT_TO_AGENT=agent-subscription
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# System Configuration
SCREENSHOT_PATH=/tmp/vm-screenshots
STATS_LOG_PATH=/var/log/vm-stats.csv
LOG_LEVEL=info
SERVICE_NAME=vm-sentinel

Error Handling & Reliability
Error Handling Patterns
async function withRetry(operation, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

class CircuitBreaker {
  constructor(threshold = 5, resetTime = 60000) {}
  async execute(operation) {}
  isOpen() {}
}

Logging Requirements
const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/var/log/vm-sentinel.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

Systemd Service Integration
Service File (vm-sentinel.service)
[Unit]
Description=VM Sentinel
Documentation=https://github.com/your-repo/vm-sentinel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=your_username
Group=your_username
WorkingDirectory=/opt/vm-sentinel
EnvironmentFile=/opt/vm-sentinel/.env
ExecStart=/usr/bin/node index.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=30
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/tmp /var/log

[Install]
WantedBy=multi-user.target

Signal Handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await vmAgent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await vmAgent.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

Documentation Requirements (README.md)
Sections

Quick Start Guide - Setup in <10 minutes  
Prerequisites - System requirements and dependencies  
Installation Steps - Step-by-step setup  
Configuration - Environment variables explained  
Google Cloud Setup - GCP configuration guide  
Telegram Bot Setup - @BotFather walkthrough  
Systemd Service - Service installation and management  
Troubleshooting - Common issues and solutions  
Monitoring - Checking service health and CSV logs  
Security - Best practices

Code Quality Requirements

ESLint: Airbnb style guide compliance  
Error Handling: Try-catch for all async operations  
Input Validation: Validate configs and inputs  
Testing: Unit tests for core functions (Jest)

Implementation Priority

Phase 1: Logging infrastructure and system monitoring  
Phase 2: Screenshot capture and comparison  
Phase 3: Input monitoring and idle detection  
Phase 4: Pub/Sub integration and messaging  
Phase 5: Systemd service and production hardening  
Phase 6: Documentation and testing

Success Criteria

Runs continuously for 24+ hours without crashes  
Detects idle state within configured parameters  
Captures and transmits screenshots successfully  
Responds to Telegram commands within 30 seconds  
Logs stats to CSV with 1-month retention  
Uses <100MB RAM and <5% CPU on average  
Comprehensive error handling with recovery

Additional Implementation Notes
VM Stats Data Structure
const vmStatsEntry = {
  timestamp: new Date().toISOString(),
  hostname: os.hostname(),
  system: {
    cpu_usage: await si.currentLoad().then(data => data.currentload),
    ram_usage: await si.mem().then(data => (data.used / data.total) * 100),
    disk_usage: await si.fsSize().then(data => data[0].use),
    uptime_hours: os.uptime() / 3600,
  },
  idle_tracking: {
    is_idle: this.idleState.isIdle,
    idle_duration_minutes: this.idleState.duration,
    last_activity_timestamp: this.idleState.lastInput,
  }
};

CSV Stats Logging

File: /var/log/vm-stats.csv  
Format: timestamp,hostname,cpu_usage,ram_usage,disk_usage,uptime_hours,is_idle,idle_duration_minutes,last_activity_timestamp  
Logged every minute for Excel analysis
