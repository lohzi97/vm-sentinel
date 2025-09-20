/**
 * VM Sentinel Agent - Main Entry Point
 * 
 * This is the main service that monitors VM health and communicates
 * with the Telegram bot via Google Pub/Sub.
 */

import { createLogger } from './utils/logger.js';

const logger = createLogger('agent');

async function main() {
  logger.info('VM Sentinel Agent starting...');
  
  try {
    // TODO: Initialize monitoring modules
    // TODO: Setup Pub/Sub communication
    // TODO: Start health monitoring loop
    
    logger.info('VM Sentinel Agent started successfully');
    
    // Keep the process running
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start VM Sentinel Agent:', error);
    process.exit(1);
  }
}

// Start the agent
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
