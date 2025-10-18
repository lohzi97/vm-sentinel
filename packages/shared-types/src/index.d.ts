export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    timestamp: string;
}
export interface IdleState {
    isIdle: boolean;
    idleDurationSeconds: number;
    lastActivity: string;
    confidence: number;
}
export interface StatusMessage {
    type: 'status';
    vmId: string;
    metrics: SystemMetrics;
    idleState: IdleState;
    timestamp: string;
}
export interface CommandMessage {
    type: 'command';
    vmId: string;
    command: 'shutdown' | 'restart' | 'screenshot' | 'status';
    userId: string;
    timestamp: string;
}
export interface AlertMessage {
    type: 'alert';
    vmId: string;
    alertType: 'idle_detected' | 'resource_warning' | 'system_error';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
}
export interface AgentConfig {
    vmId: string;
    monitoringInterval: number;
    idleThreshold: number;
    pubsubTopics: {
        status: string;
        commands: string;
        alerts: string;
    };
}
export interface BotConfig {
    botToken: string;
    allowedUsers: string[];
    pubsubTopics: {
        status: string;
        commands: string;
        alerts: string;
    };
}
export type PubSubMessage = StatusMessage | CommandMessage | AlertMessage;
export declare function isStatusMessage(message: unknown): message is StatusMessage;
export declare function isCommandMessage(message: unknown): message is CommandMessage;
export declare function isAlertMessage(message: unknown): message is AlertMessage;
//# sourceMappingURL=index.d.ts.map