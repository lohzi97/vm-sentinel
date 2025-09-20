# Section 9: Database Schema

For the MVP, this project does not use a traditional SQL or NoSQL database. To minimize operational overhead and stick to the lightweight goals of the project, all persistent data is stored in a simple Comma-Separated Values (CSV) file on the local VM.

### `metrics.csv` Schema
This file is located on the VM and is appended to by the VM Agent at a regular interval.

**Purpose:** To log system metrics over time for debugging and verification during development.

**Columns:**
1.  `timestamp`: ISO 8601 formatted string. The time the metrics were recorded.
2.  `cpu_usage`: Floating point number. The system-wide CPU utilization percentage.
3.  `ram_usage`: Floating point number. The system-wide RAM usage percentage.
4.  `last_input_timestamp`: ISO 8601 formatted string. The timestamp of the last detected keyboard or mouse activity.

**Example:**
```csv
timestamp,cpu_usage,ram_usage,last_input_timestamp
"2025-09-16T10:00:00Z",15.5,45.2,"2025-09-16T09:55:10Z"
"2025-09-16T10:00:05Z",12.1,45.3,"2025-09-16T09:55:10Z"
"2025-09-16T10:00:10Z",25.8,48.1,"2025-09-16T10:00:10Z"
```
