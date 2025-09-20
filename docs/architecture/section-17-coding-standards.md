# Section 17: Coding Standards

### Critical Fullstack Rules
- **Single Source of Truth for Types:** All shared types, especially the Pub/Sub message interfaces (`StatusMessage`, `CommandMessage`, etc.), **MUST** be defined in the `packages/shared-types` package. The `agent` and `bot` apps **MUST** import these types from the shared package. Do not redefine them. This is critical for preventing data contract mismatches.
- **Centralized Environment Configuration:** Environment variables (`process.env`) should only be accessed in a single configuration file at the root of each app (e.g., `apps/bot/src/config.ts`). The rest of the application should import a typed, validated configuration object from this file. This prevents configuration drift and provides type safety.
- **Abstract System Calls:** In the VM Agent, do not use `exec` or `spawn` directly in business logic. All interactions with the operating system (`shutdown`, `scrot`, `xinput`) **MUST** be wrapped in a dedicated, mockable service module. This is essential for testing and security.
- **Robust Error Handling:** Every command handler and asynchronous process must be wrapped in a `try...catch` block. On error, log the technical details and provide a user-friendly error message to the user if possible. Never let an unhandled promise rejection crash the application.

### Naming Conventions
| Element | Convention | Example |
| :--- | :--- | :--- |
| Files | `kebab-case.ts` | `system-monitor.ts` |
| Classes | `PascalCase` | `class SystemMonitor { ... }` |
| Interfaces | `PascalCase` | `interface StatusMessage { ... }` |
| Functions / Variables | `camelCase` | `const cpuUsage = getCpuUsage();` |
| Constants | `UPPER_SNAKE_CASE` | `const DEFAULT_TIMEOUT = 600;` |
| Pub/Sub Topics | `kebab-case` | `vm-commands-topic`
