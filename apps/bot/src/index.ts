/**
 * VM Sentinel Bot - Cloud Function Entry Point
 * 
 * This is the main entry point for the Telegram bot that runs as
 * a Google Cloud Function and handles webhook requests.
 */

import { http } from '@google-cloud/functions-framework';
import express from 'express';
import { createLogger } from './utils/logger.js';

const logger = createLogger('bot');

// Initialize Express app
const app = express();

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'vm-sentinel-bot' });
});

// Webhook handler for Telegram
app.post('/webhook', async (req, res) => {
  try {
    logger.info('Received webhook request');
    
    // TODO: Initialize Telegraf bot
    // TODO: Process webhook update
    // TODO: Handle bot commands
    
    res.status(200).json({ ok: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register the HTTP function
http('webhookHandler', app);

export { app };
