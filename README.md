# VM Sentinel

VM Sentinel is a comprehensive virtual machine monitoring solution that combines intelligent monitoring with remote control capabilities through Telegram.

## Overview

VM Sentinel consists of two main components:

1. **VM Monitoring Agent** - A Node.js service that runs on your VM to monitor system health, idle state, and performance metrics
2. **Telegram Bot** - A serverless backend that enables remote control and monitoring of your VM through Telegram commands

## Features

- **Real-time VM Monitoring**: Track CPU usage, memory consumption, and system health
- **Intelligent Idle Detection**: Smart algorithms to detect when your VM is truly idle vs. just appearing inactive
- **Remote Control via Telegram**: Shutdown, restart, and monitor your VM remotely through intuitive bot commands
- **Screenshot Capture**: Take and share screenshots of your VM's current state
- **Alert System**: Proactive notifications when issues are detected or thresholds are exceeded

## Architecture

This project uses a monorepo structure with npm workspaces:

- `apps/agent/` - VM monitoring agent (Node.js service)
- `apps/bot/` - Telegram bot backend (Google Cloud Function)
- `packages/shared-types/` - Shared TypeScript interfaces and types
- `packages/eslint-config-custom/` - Shared ESLint configuration

## Tech Stack

- **Runtime**: Node.js 18.x LTS
- **Language**: TypeScript
- **Testing**: Jest 29.x
- **Bot Framework**: Telegraf
- **Cloud Platform**: Google Cloud Platform
- **Messaging**: Google Pub/Sub
- **Build Tool**: esbuild for bundling

## Getting Started

```bash
# Install dependencies
npm install

# Start development environment
npm run dev

# Run tests
npm test --workspaces

# Lint code
npm run lint --workspaces
```

## Project Structure

```
vm-sentinel/
├── apps/
│   ├── agent/          # VM monitoring agent
│   └── bot/            # Telegram bot backend
├── packages/
│   ├── shared-types/   # Shared TypeScript types
│   └── eslint-config-custom/
├── scripts/            # Utility scripts
├── docs/              # Documentation
└── README.md
```

## Development

This project follows strict coding standards and uses a comprehensive testing strategy. See the documentation in the `docs/` directory for detailed development guidelines.

## License

Private project - All rights reserved.
