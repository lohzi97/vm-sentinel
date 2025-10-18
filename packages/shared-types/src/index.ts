/**
 * Shared TypeScript interfaces and types for VM Sentinel
 * 
 * This package contains all shared data models and types used
 * across the agent and bot applications.
 */

// Status and monitoring types
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number; // Optional - not yet implemented, will be added in future stories
  timestamp: string;
}

export interface IdleState {
  isIdle: boolean;
  idleDurationSeconds: number;
  lastActivity: string;
  confidence: number;
}

// Pub/Sub message types - critical for preventing data contract mismatches
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

// Configuration types
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

// Union types for message handling
export type PubSubMessage = StatusMessage | CommandMessage | AlertMessage;

// Type guards for runtime type checking
export function isStatusMessage(message: unknown): message is StatusMessage {
  return typeof message === 'object' && message !== null && 'type' in message && message.type === 'status';
}

export function isCommandMessage(message: unknown): message is CommandMessage {
  return typeof message === 'object' && message !== null && 'type' in message && message.type === 'command';
}

export function isAlertMessage(message: unknown): message is AlertMessage {
  return typeof message === 'object' && message !== null && 'type' in message && message.type === 'alert';
}
