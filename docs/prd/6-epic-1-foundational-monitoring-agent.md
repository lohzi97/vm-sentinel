# 6. Epic 1: Foundational Monitoring Agent

This epic establishes the core foundation of the VM Sentinel project. The objective is to create a runnable agent that can successfully monitor key system resources and user input on the target VM and record them. This provides the fundamental data-gathering capability required for all subsequent features.

## Story 1.1: Project Scaffolding

**As a developer, I want a well-structured monorepo with initial project setup, so that I can begin developing the agent and bot in a clean and organized environment.**

### Acceptance Criteria:

1.  A Git repository is initialized.
2.  A `README.md` file is created with a basic project description.
3.  A monorepo structure is in place (e.g., using npm workspaces) with `packages/agent` and `packages/bot` directories.
4.  Each package has its own `package.json` file with basic metadata.
5.  A root-level `package.json` manages the workspaces and common dev dependencies (e.g., a linter).

## Story 1.2: System Resource Monitoring

**As the system, I want to monitor CPU and RAM usage periodically, so that I have the data needed to assess machine activity.**

### Acceptance Criteria:

1.  The agent can read the current system-wide CPU utilization as a percentage.
2.  The agent can read the current system-wide RAM usage as a percentage.
3.  This data is captured at a configurable interval (e.g., every 5 seconds).
4.  The monitoring functions are encapsulated in their own module.
5.  The resource usage data is available within the main agent service for further processing.

## Story 1.3: User Input Monitoring

**As the system, I want to detect keyboard and mouse activity, so that I can determine if a user is physically interacting with the machine.**
*(Prerequisite: Story 1.2)*

### Acceptance Criteria:

1.  The agent can detect when a keyboard key is pressed.
2.  The agent can detect when the mouse is moved or a button is clicked.
3.  A simple "last input time" timestamp is updated upon any detected input.
4.  The monitoring is done by polling the state of input devices using `xinput` or a similar tool.
5.  The "last input time" is available within the main agent service.

## Story 1.4: Local CSV Logging

**As a developer, I want the collected metrics (CPU, RAM, input activity) to be written to a local CSV file, so that I can verify the agent is working correctly and analyze the data during development.**
*(Prerequisite: Story 1.3)*

### Acceptance Criteria:

1.  A new entry is appended to a `metrics.csv` file at a regular interval.
2.  The CSV entry contains a timestamp, CPU usage (%), RAM usage (%), and the timestamp of the last user input.
3.  The CSV file is created if it does not exist.
4.  The logging mechanism correctly handles file access and does not crash if the file is temporarily unavailable.

---