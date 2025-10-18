/**
 * SystemMonitor - System Resource Monitoring Module
 * 
 * Monitors CPU and RAM usage at configurable intervals using Node.js built-in APIs.
 * Follows the coding standards by abstracting system calls and using structured logging.
 */

import { createLogger } from '../utils/logger.js';
import { SystemMetrics } from '@vm-sentinel/shared-types';
import * as os from 'os';

const logger = createLogger('system-monitor');

export interface SystemMonitorConfig {
  monitoringInterval: number; // in milliseconds
}

export interface SystemService {
  getCpuUsage(): Promise<number>;
  getRamUsage(): Promise<number>;
}

/**
 * System service implementation using Node.js built-in APIs
 * This abstraction allows for easy mocking in tests
 */
export class NodeSystemService implements SystemService {
  private previousCpuInfo: os.CpuInfo[] | null = null;

  async getCpuUsage(): Promise<number> {
    try {
      const currentCpuInfo = os.cpus();

      if (this.previousCpuInfo === null) {
        // First call - store baseline and return 0
        this.previousCpuInfo = currentCpuInfo;
        return 0;
      }

      let totalIdle = 0;
      let totalTick = 0;

      for (let i = 0; i < currentCpuInfo.length && i < this.previousCpuInfo.length; i++) {
        const current = currentCpuInfo[i];
        const previous = this.previousCpuInfo[i];

        if (!current || !previous) {
          continue;
        }

        const currentTotal = Object.values(current.times).reduce((acc, time) => acc + time, 0);
        const previousTotal = Object.values(previous.times).reduce((acc, time) => acc + time, 0);

        const currentIdle = current.times.idle;
        const previousIdle = previous.times.idle;

        const totalDiff = currentTotal - previousTotal;
        const idleDiff = currentIdle - previousIdle;

        totalIdle += idleDiff;
        totalTick += totalDiff;
      }

      this.previousCpuInfo = currentCpuInfo;

      if (totalTick === 0) {
        return 0;
      }

      const cpuUsage = 100 - (100 * totalIdle / totalTick);
      return Math.max(0, Math.min(100, cpuUsage));
    } catch (error) {
      logger.error('Failed to read CPU usage:', error);
      throw new Error('Failed to read CPU usage');
    }
  }

  async getRamUsage(): Promise<number> {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const ramUsage = (usedMemory / totalMemory) * 100;
      
      return Math.max(0, Math.min(100, ramUsage));
    } catch (error) {
      logger.error('Failed to read RAM usage:', error);
      throw new Error('Failed to read RAM usage');
    }
  }
}

/**
 * SystemMonitor class - Monitors system resources at configurable intervals
 */
export class SystemMonitor {
  private config: SystemMonitorConfig;
  private systemService: SystemService;
  private monitoringTimer: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private currentMetrics: SystemMetrics | null = null;

  constructor(config: SystemMonitorConfig, systemService: SystemService = new NodeSystemService()) {
    this.config = config;
    this.systemService = systemService;
    
    logger.info('SystemMonitor initialized', {
      monitoringInterval: config.monitoringInterval
    });
  }

  /**
   * Start monitoring system resources
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Monitoring is already running');
      return;
    }

    try {
      logger.info('Starting system resource monitoring', {
        interval: this.config.monitoringInterval
      });

      this.isMonitoring = true;
      await this.collectMetrics(); // Collect initial metrics

      this.monitoringTimer = setInterval(async () => {
        try {
          await this.collectMetrics();
        } catch (error) {
          logger.error('Error during periodic metrics collection:', error);
        }
      }, this.config.monitoringInterval);

      logger.info('System monitoring started successfully');
    } catch (error) {
      this.isMonitoring = false;
      logger.error('Failed to start system monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring system resources
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      logger.warn('Monitoring is not running');
      return;
    }

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    this.isMonitoring = false;
    logger.info('System monitoring stopped');
  }

  /**
   * Get the current system metrics
   */
  getCurrentMetrics(): SystemMetrics | null {
    return this.currentMetrics;
  }

  /**
   * Get current CPU usage percentage
   */
  async getCpuUsage(): Promise<number> {
    return this.systemService.getCpuUsage();
  }

  /**
   * Get current RAM usage percentage
   */
  async getRamUsage(): Promise<number> {
    return this.systemService.getRamUsage();
  }

  /**
   * Check if monitoring is currently active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const [cpuUsage, ramUsage] = await Promise.all([
        this.systemService.getCpuUsage(),
        this.systemService.getRamUsage()
      ]);

      this.currentMetrics = {
        cpuUsage,
        memoryUsage: ramUsage,
        // diskUsage is omitted (optional field) - will be implemented in future stories
        timestamp: new Date().toISOString()
      };

      logger.info('System metrics collected', {
        cpuUsage: cpuUsage.toFixed(2),
        memoryUsage: ramUsage.toFixed(2),
        timestamp: this.currentMetrics.timestamp
      });
    } catch (error) {
      logger.error('Failed to collect system metrics:', error);
      throw error;
    }
  }
}
