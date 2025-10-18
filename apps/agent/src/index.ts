/**
 * VM Sentinel Agent - Main Entry Point
 * 
 * This is the main service that monitors VM health and communicates
 * with the Telegram bot via Google Pub/Sub.
 */

import { createLogger } from './utils/logger.js';
import { loadAgentConfig } from './config.js';
import { SystemMonitor } from './modules/system-monitor.js';

const logger = createLogger('agent');

// Global references for graceful shutdown
let systemMonitor: SystemMonitor | null = null;

async function main() {
  logger.info('VM Sentinel Agent starting...');
  
  try {
    // Load configuration
    const config = loadAgentConfig();
    logger.info('Configuration loaded successfully');

    // Initialize SystemMonitor
    systemMonitor = new SystemMonitor({
      monitoringInterval: config.monitoringInterval
    });

    // Start system monitoring
    await systemMonitor.startMonitoring();
    logger.info('System monitoring started');

    // TODO: Setup Pub/Sub communication
    // TODO: Initialize other monitoring modules (input, screen)
    
    logger.info('VM Sentinel Agent started successfully');
    
    // Keep the process running
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      handleShutdown();
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      handleShutdown();
    });
    
  } catch (error) {
    logger.error('Failed to start VM Sentinel Agent:', error);
    await handleShutdown();
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown of the agent
 */
async function handleShutdown(): Promise<void> {
  logger.info('Shutting down VM Sentinel Agent gracefully...');
  
  try {
    // Stop system monitoring
    if (systemMonitor) {
      systemMonitor.stopMonitoring();
      logger.info('System monitoring stopped');
    }

    // TODO: Close Pub/Sub connections
    // TODO: Stop other monitoring modules
    
    logger.info('VM Sentinel Agent shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Get current system metrics (for use by other modules)
 */
export function getCurrentSystemMetrics() {
  return systemMonitor?.getCurrentMetrics() || null;
}

/**
 * Check if system monitoring is active
 */
export function isSystemMonitoringActive(): boolean {
  return systemMonitor?.isMonitoringActive() || false;
}

// Start the agent
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
