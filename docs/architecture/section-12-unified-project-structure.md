# Section 12: Unified Project Structure

This monorepo structure is designed for a full-stack Node.js/TypeScript project, promoting code sharing and unified tooling. It is organized using `npm workspaces`.

```plaintext
vm-sentinel/
├── .github/                    # CI/CD workflows (e.g., for GitHub Actions)
│   └── workflows/
│       └── ci.yaml
├── apps/                       # The deployable applications
│   ├── bot/                    # The serverless Telegram bot backend
│   │   ├── src/
│   │   │   ├── handlers/       # Logic for commands and actions
│   │   │   ├── services/       # Clients for external services (Pub/Sub)
│   │   │   ├── bot.ts          # Telegraf instance setup
│   │   │   └── index.ts        # Main Cloud Function entry point
│   │   ├── tests/
│   │   └── package.json
│   └── agent/                  # The VM monitoring agent
│       ├── src/
│       │   ├── modules/        # Core monitoring and communication logic
│       │   ├── config.ts       # Configuration loader
│       │   └── index.ts        # Main service entry point
│       ├── tests/
│       └── package.json
├── packages/                   # Shared packages used by the apps
│   ├── shared-types/           # Shared TypeScript interfaces (Data Models)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   └── eslint-config-custom/   # Shared ESLint configuration
│       └── index.js
├── scripts/                    # Utility scripts (e.g., build, deploy)
├── docs/                       # Project documentation
│   ├── prd.md
│   └── architecture.md
├── .env.example                # Template for environment variables
├── package.json                # Root package.json defining workspaces
├── tsconfig.base.json          # Shared base TypeScript configuration
└── README.md
```
