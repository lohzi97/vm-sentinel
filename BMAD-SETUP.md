# BMad Method Project Setup Guide

Welcome to the team! This project uses the **BMad (Breakthrough Method of Agile AI-driven Development)** to structure our development process and collaborate effectively with AI agents.

Following this guide is essential for setting up your environment correctly.

## What is the BMad Method?

BMad provides a structured workflow where we use a team of specialized AI agents (like a Product Manager, Architect, Developer, and Test Architect) to build software. This ensures consistency, quality, and allows us to leverage AI for planning, coding, and testing in a predictable way.

The definitions for all our agents and workflows are stored in the `.bmad-core/` directory, which is the source of truth for our methodology.

## Prerequisites

Before you begin, please ensure you have the following installed:

1.  **Git**
2.  **Node.js** (version 18 or higher)
3.  **npm** (version 9 or higher)
4.  An **AI-powered IDE or CLI** that is compatible with BMad (e.g., Gemini CLI, Cline, Cursor).

## Local Environment Setup

Follow these steps to get your local environment configured.

### Step 1: Clone the Repository

Clone this project to your local machine.

```bash
git clone <repository-url>
cd <repository-name>
```

### Step 2: Install Project Dependencies

Install the project's Node.js dependencies.

```bash
npm install
```

### Step 3: Install BMad Method Configuration

This is the most important step. You will run the BMad installer, which reads the project's agent definitions from the `.bmad-core/` directory and generates the necessary configuration files for your specific AI tools.

**Do not skip this step!** These generated files are required for the AI agents to function in your IDE.

```bash
npx bmad-method install
```

This command will create local, tool-specific configuration files (like `.gemini/` or `.clinerules`) that are unique to your machine and should **not** be committed to Git.

## Your First Development Cycle

The core development loop is simple and sequential:

1.  **Draft a Story:** In a **new chat**, load the Scrum Master agent (`@sm`) and run the `*draft` command.
2.  **Approve the Story:** Open the generated story file in `docs/stories/` and change its status from `Draft` to `Approved`.
3.  **Implement the Story:** In a **new chat**, load the Developer agent (`@dev`) and tell it which story to implement.
4.  **Review the Code:** After the `dev` agent is finished, start a **new chat**, load the Test Architect (`@qa`), and run the `*review` command.
5.  **Commit:** Once the story passes the QA review and the status is `Done`, commit all the changes.

**Key Principle:** Always start a **new, clean chat session** when switching between agents (`@sm`, `@dev`, `@qa`). This is critical for getting the best results.

## Keeping Your Setup in Sync

If a team member updates an agent's behavior by changing a file in the `.bmad-core/` directory, you will need to refresh your local configuration. To do this, simply re-run the installer:

```bash
npx bmad-method install
```

This ensures you are always working with the latest version of our team's AI agents.

## Further Reading

For more detailed information, please review the following documents in the repository:

*   `user-guide.md`: The complete guide to the BMad method and its workflows.
*   `enhanced-ide-development-workflow.md`: A quick reference for the development cycle.
