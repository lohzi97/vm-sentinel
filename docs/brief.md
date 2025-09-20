# Project Brief: VM Sentinel

## Executive Summary

VM Sentinel is an intelligent virtual machine (VM) monitoring system designed to automatically detect idle states and allow for remote shutdown via Telegram commands. The primary problem it solves is the unnecessary cloud computing costs incurred by VMs that are left running while idle.

The target market appears to be developers, system administrators, and other technical users who utilize GUI-based cloud VMs and are looking for an automated way to manage resources and reduce costs.

The key value proposition of VM Sentinel lies in its ability to provide:
*   **Automated Resource Management:** Prevents unnecessary cloud costs from idle VMs.
*   **Remote Accessibility:** Securely control VMs from anywhere via Telegram.
*   **Production Ready:** A robust and reliable service with comprehensive error handling and logging.

## Problem Statement

Users of cloud-based virtual machines, particularly those with graphical user interfaces (GUIs) for development or remote work, frequently leave these instances running even when they are not actively in use. This leads to significant and unnecessary financial costs, as cloud providers bill for uptime regardless of whether the user is interacting with the machine.

The core pain points are:
*   **Manual Oversight is Inefficient:** Remembering to manually shut down a VM after every session is inconvenient and easily forgotten.
*   **Lack of Intelligent Idleness Detection:** Existing cloud provider tools often rely on simple metrics like CPU utilization, failing to account for the nuances of a GUI session (e.g., no keyboard/mouse activity). This can lead to failing to shut down a truly idle machine.
*   **Inconvenient Remote Management:** Initiating a shutdown typically requires logging into a cloud provider's console, which is cumbersome, especially from a mobile device.

The impact of this problem is direct financial waste. For individual developers, this can be a substantial portion of their monthly cloud bill, while for larger organizations, the cumulative cost can be thousands of dollars annually. Given the constant pressure to optimize cloud spending, a solution that provides intelligent and convenient VM management is highly valuable.

## Proposed Solution

VM Sentinel is an intelligent, lightweight agent that runs as a service on the target virtual machine. It continuously monitors a combination of signals to determine if the machine is truly idle. These signals include:
1.  System resource usage (CPU, RAM).
2.  User input activity (keyboard and mouse).
3.  Changes in the graphical user interface (detected by comparing periodic screenshots).

When the agent determines the VM has been idle for a configurable duration, it securely sends a notification to the user via a Telegram bot. This alert includes recent system statistics and a current screenshot, along with an option to shut the machine down remotely. Users can also proactively request stats or initiate a shutdown from anywhere using simple bot commands (e.g., `/stats`, `/shutdown`).

The key differentiators of this solution are:
*   **Holistic Idle Detection:** By combining system metrics with user input and screen analysis, it provides a far more accurate assessment of idleness than standard tools.
*   **Convenient, Push-Based Control:** It leverages the popular Telegram messaging app for proactive alerts and simple, secure commands, meeting users on the devices they use most.
*   **Secure and Decoupled Architecture:** It uses a robust cloud messaging backbone (Google Pub/Sub) to ensure reliable communication without directly exposing the VM to the internet.

The vision is to provide an "easy to turn off" utility, giving users a simple and immediate way to shut down their VM even when they are not in front of their machine.

## Target Users

### Primary User Segment: The Technical Cloud User

*   **Profile:** This segment includes developers, system administrators, data scientists, and QA engineers. They rely on cloud-based VMs with a graphical desktop environment (e.g., accessed via Chrome Remote Desktop) for their daily tasks, which may include coding, data analysis, or software testing.
*   **Behaviors & Workflows:** Their workflow is often intermittent, with periods of intense activity followed by hours where the VM is running but not actively used. They are cost-conscious but value convenience, often forgetting to shut down instances and incurring unnecessary costs. They are typically active users of mobile messaging apps like Telegram.
*   **Needs & Pain Points:** They need a simple, reliable way to reduce their cloud bill without the hassle of manual shutdowns. They also need a way to remotely control their machine's power state when they are away from their primary workstation.
*   **Goals:** To minimize cloud expenditure without sacrificing the flexibility and power of having an on-demand, remote desktop environment.

## Goals & Success Metrics

### Business Objectives
*   **Reduce Cloud Waste:** Directly decrease operational costs for users by eliminating billing for idle VM hours.
*   **Drive Adoption:** Create a valuable and easy-to-use utility that becomes an essential tool for the target user base.

### User Success Metrics
*   **Effortless Control:** Users feel they can easily and reliably shut down their VM from anywhere, at any time. Success is indicated by frequent and consistent use of the remote shutdown feature.
*   **Trust in the System:** Users are confident that the service will not incorrectly shut down their machine during an active session, allowing them to "set it and forget it."
*   **Tangible Cost Savings:** Users can point to a noticeable reduction in their monthly cloud bills as a direct result of using VM Sentinel.

### Key Performance Indicators (KPIs)
*   **Active Installations:** The total number of VMs actively running the VM Sentinel service.
*   **Remote Commands Executed:** The number of successful `/shutdown` and `/stats` commands processed per month.
*   **Idle Hours Saved:** The cumulative number of hours that VMs were shut down by the service while idle across the user base.
*   **User Retention Rate:** The percentage of users who continue to use the service after their first month.

## MVP Scope

### Core Features (Must Have)

*   **VM Agent with Multi-Signal Monitoring:** A background service that monitors CPU usage, RAM usage, and keyboard/mouse input to track activity.
    *   *Rationale:* These are the fundamental signals for determining if a machine is active or idle.
*   **Screenshot Comparison:** The agent must periodically capture and compare screenshots to detect visual changes on the screen.
    *   *Rationale:* This is the key differentiator that allows the system to know if a user is present but passive (e.g., reading, watching a video), preventing false shutdowns.
*   **Configurable Idle Timer:** The agent triggers an alert only after a user-defined period of inactivity has been met.
    *   *Rationale:* Provides essential flexibility for different user workflows.
*   **Secure Cloud Communication:** The agent and bot must communicate via Google Cloud Pub/Sub.
    *   *Rationale:* Ensures a secure, reliable, and decoupled architecture.
*   **Telegram Bot for Commands & Alerts:** A bot that delivers idle alerts and processes user commands.
    *   *Rationale:* This is the primary user interface for the service.
*   **Remote Commands (`/shutdown`, `/stats`):** The bot must handle requests for immediate shutdown and on-demand system statistics.
    *   *Rationale:* These two commands deliver the core remote control functionality.
*   **User Authentication:** The bot must validate that commands originate from an authorized Telegram Chat ID.
    *   *Rationale:* A critical security measure to prevent unauthorized access.

### Out of Scope for MVP

*   A web-based dashboard or UI.
*   Advanced historical analytics, charts, or cost-saving reports.
*   Support for operating systems other than Debian 12, or other cloud providers.
*   Advanced alerting rules (e.g., snoozing alerts, setting "quiet hours").
*   Features for managing teams or fleets of VMs.

### MVP Success Criteria

*   The system reliably detects an idle state on a Debian 12 XFCE VM and successfully sends a notification to the user's Telegram.
*   A user can successfully execute a `/shutdown` command from Telegram, and the target VM will gracefully shut down.
*   The end-to-end system (agent and bot) operates continuously for at least 72 hours without critical failures.
*   The setup process is documented clearly enough for a target user to complete it in under 15 minutes.

## Post-MVP Vision

### Phase 2 Features (Next Priorities)

*   **Web Dashboard:** A simple web interface to view the status of all monitored VMs, see basic historical stats (like idle hours saved), and manage configuration in one place.
*   **Advanced Alerting Rules:** Introduce features like the ability to "snooze" a shutdown alert for an hour or set "quiet hours" during which notifications are suppressed.
*   **Broader Platform Support:** Based on user feedback, add support for other popular Linux distributions (like Ubuntu) and potentially other operating systems.

### Long-term Vision (1-2 Years)

The long-term vision is for VM Sentinel to be the standard, "must-have" utility for remote VM management. The focus will be on making remote power management as easy and intuitive as sending a text message. This includes expanding beyond idle-based shutdowns to become a more comprehensive remote control tool, potentially with commands for rebooting, running pre-defined scripts, or getting application-level health checks, all from the user's chosen messaging app.

### Expansion Opportunities

*   **Team & Enterprise Features:** Develop features for organizations to manage a fleet of VMs across multiple users, with centralized billing, user roles, and department-level policies.
*   **Cloud Marketplace Integration:** Package VM Sentinel for one-click deployment from major cloud marketplaces (GCP, AWS, Azure).
*   **Multi-Channel Notifications:** Expand beyond Telegram to support other popular messaging platforms like Slack or Discord.

## Technical Considerations

### Platform Requirements
*   **Target Platform:** The VM agent is designed specifically for Debian 12 ("Bookworm") with an XFCE desktop environment.
*   **User Interface:** The user-facing interface is Telegram, which is accessible on any platform with a Telegram client (iOS, Android, Web, Desktop).
*   **Performance Requirements:** The agent is intended to be lightweight, with a target baseline resource usage of less than 50MB of RAM and 2% average CPU.

### Technology Preferences
*   **VM Agent:** Node.js (v18.x LTS or higher).
*   **Bot Interface:** A serverless function on Google Cloud Functions (Node.js runtime).
*   **Data Storage:** For the MVP, system statistics will be logged to a local CSV file. No external database is required.
*   **Cloud Infrastructure:** Google Cloud Platform will be used for hosting the bot (Cloud Functions) and for the messaging layer (Pub/Sub).

### Architecture Considerations
*   **Service Architecture:** The system will use a decoupled architecture. A Google Cloud Pub/Sub topic will serve as a secure message bus between the VM agent and the Telegram bot, preventing the need for the VM to have any open inbound ports to the internet.
*   **System Dependencies:** The agent requires `scrot` and `xinput` to be installed on the host VM for screenshot capture and input monitoring, respectively.
*   **Security:** Authentication will be managed by validating the user's Telegram Chat ID against a pre-authorized list stored in an environment variable. All communication with Google Cloud will be authenticated via a service account with minimal permissions.

## Constraints & Assumptions

### Constraints

*   **Budget:** A formal budget has not been defined. The architecture relies on serverless components (Google Cloud Functions) and a lightweight agent to keep operational costs minimal, likely within free or low-cost tiers for individual users.
*   **Timeline:** A specific delivery timeline has not been set.
*   **Technical:** The MVP is constrained to the Node.js ecosystem and is specifically targeting a Debian 12 + XFCE environment. The project is dependent on the continued availability and stability of the public APIs for Telegram and Google Cloud.

### Key Assumptions

*   **User's Technical Proficiency:** We assume the target user is comfortable with the Linux command line and can follow a documented process to install an agent and configure environment variables.
*   **Target Environment Stability:** We assume the Debian 12 + XFCE environment is stable and that the required system tools (`scrot`, `xinput`) are readily available and function as expected.
*   **Persistent GUI Session:** The solution fundamentally assumes that a graphical user interface is always running on the VM (e.g., via Chrome Remote Desktop). The screenshot comparison logic would be ineffective on a headless server.
*   **Compelling Value Proposition:** We assume the promise of cost savings and remote control is strong enough to motivate a user to complete the initial setup process.

## Risks & Open Questions

### Key Risks

*   **Incorrect Shutdowns (False Positives):** The most significant risk is the system incorrectly identifying a VM as idle and shutting it down while it's in use (e.g., during a long-running computation the user is observing).
    *   *Impact:* High. This would erode user trust and could lead to data loss.
*   **Setup Complexity:** The multi-step setup process (installing agent, configuring GCP, setting up Telegram) might be too burdensome for some target users, leading to low adoption.
    *   *Impact:* Medium. This would limit the project's reach.
*   **Dependency Changes:** A breaking change in the Telegram API, Google Cloud services, or a core system dependency (`scrot`, `xinput`) could disable the service until a patch is released.
    *   *Impact:* Medium. This would cause service interruptions.
*   **Security Vulnerability:** A flaw in the agent or bot could potentially allow unauthorized control of the VM if not properly secured.
    *   *Impact:* High. This would represent a major security failure.

### Open Questions

*   What is the acceptable margin of error for idle detection? How should the system balance cost savings against the risk of a false positive shutdown?
*   How should the agent behave if it loses internet connectivity for an extended period? Should it shut down by default, or remain running?
*   What is the best way to handle system updates for the agent itself?
*   How should the system differentiate between a user's GUI session and a background process that is intentionally keeping the machine busy?

### Areas Needing Further Research

*   **Performance on Various VM Sizes:** How does the agent's resource footprint scale on very small (e.g., `e2-micro`) versus very large VMs?
*   **Alternative Input Monitoring Methods:** Are there more reliable or efficient ways to detect user input on Linux that are less resource-intensive than the current approach?
*   **User Onboarding Experience:** Researching the clearest and simplest way to guide a new user through installation. Could parts of the setup be automated with an installation script?

## Appendices

### A. Research Summary
This project brief was developed based on the detailed technical specification and AI agent prompt found in the `initial_doc.md` file. This document served as the primary source of research and context.

### B. Stakeholder Input
The content of this brief was created and refined through an interactive session, with stakeholder feedback incorporated at each step of the process.

### C. References
*   `initial_doc.md` - The source technical specification document for the VM Sentinel project.

## Next Steps

### Immediate Actions
1.  Finalize and save this Project Brief.
2.  Begin development of the MVP, starting with the core VM Agent monitoring functionality.
3.  Set up the necessary Google Cloud Pub/Sub topics and the Telegram bot handle.

### PM Handoff
This Project Brief provides the full context for VM Sentinel. The next step is to move into a Product Requirements Document (PRD) generation phase, reviewing this brief thoroughly to create the PRD section by section, asking for any necessary clarification and suggesting improvements.
