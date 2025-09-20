# 1. Goals and Background Context

## 1.1. Goals

The primary goals for VM Sentinel are:
*   **Reduce Cloud Waste:** Directly decrease operational costs for users by eliminating billing for idle VM hours.
*   **Drive Adoption:** Create a valuable and easy-to-use utility that becomes an essential tool for the target user base.
*   **Effortless Control:** Users feel they can easily and reliably shut down their VM from anywhere, at any time.
*   **Trust in the System:** Users are confident that the service will not incorrectly shut down their machine during an active session.
*   **Tangible Cost Savings:** Users can point to a noticeable reduction in their monthly cloud bills as a direct result of using VM Sentinel.

## 1.2. Background Context

Users of cloud-based virtual machines, particularly those with graphical user interfaces (GUIs), often leave instances running when not in use, leading to significant and unnecessary costs. Remembering to manually shut down a VM is inconvenient, and existing cloud provider tools lack intelligent idleness detection that can distinguish between a truly idle machine and one where a user is present but passive (e.g., reading or observing a long-running process).

VM Sentinel solves this by running a lightweight agent on the VM that monitors a combination of system resources, user input, and screen changes to accurately determine idleness. When a VM is confirmed to be idle, the user receives an alert via a Telegram bot with an option to shut the machine down remotely, providing a simple and effective way to manage cloud resources and reduce costs.

## 1.3. Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-16 | 1.0 | Initial PRD draft based on Project Brief. | John (PM) |

---