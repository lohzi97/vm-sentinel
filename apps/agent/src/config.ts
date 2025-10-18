/**
 * Agent Configuration Module
 * 
 * Centralized configuration management following the coding standards
 * by accessing environment variables only in this single file.
 */

import { createLogger } from './utils/logger.js';

const logger = createLogger('config');

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

const DEFAULT_MONITORING_INTERVAL = 5000; // 5 seconds
const DEFAULT_IDLE_THRESHOLD = 600; // 10 minutes in seconds

/**
 * Load and validate agent configuration from environment variables
 */
export function loadAgentConfig(): AgentConfig {
  try {
    const config: AgentConfig = {
      vmId: process.env.VM_ID || 'default-vm',
      monitoringInterval: parseInt(process.env.MONITORING_INTERVAL_MS || String(DEFAULT_MONITORING_INTERVAL), 10),
      idleThreshold: parseInt(process.env.IDLE_THRESHOLD_SECONDS || String(DEFAULT_IDLE_THRESHOLD), 10),
      pubsubTopics: {
        status: process.env.PUBSUB_STATUS_TOPIC || 'vm-status',
        commands: process.env.PUBSUB_COMMANDS_TOPIC || 'vm-commands',
        alerts: process.env.PUBSUB_ALERTS_TOPIC || 'vm-alerts',
      },
    };

    // Validate configuration
    if (config.monitoringInterval < 1000) {
      logger.warn('Monitoring interval is less than 1 second, setting to 1 second minimum');
      config.monitoringInterval = 1000;
    }

    if (config.idleThreshold < 60) {
      logger.warn('Idle threshold is less than 1 minute, setting to 1 minute minimum');
      config.idleThreshold = 60;
    }

    logger.info('Agent configuration loaded successfully', {
      vmId: config.vmId,
      monitoringInterval: config.monitoringInterval,
      idleThreshold: config.idleThreshold,
      pubsubTopics: config.pubsubTopics,
    });

    return config;
  } catch (error) {
    logger.error('Failed to load agent configuration:', error);
    throw new Error('Invalid agent configuration');
  }
}
