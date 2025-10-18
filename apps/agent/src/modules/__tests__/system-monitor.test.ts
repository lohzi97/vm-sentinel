/**
 * Unit tests for SystemMonitor module
 * 
 * Tests CPU and RAM monitoring functionality with mocked system calls
 */

import { SystemMonitor, NodeSystemService, SystemService, SystemMonitorConfig } from '../system-monitor.js';
import { SystemMetrics } from '@vm-sentinel/shared-types';

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock os module
jest.mock('os', () => ({
  cpus: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn(),
}));

describe('NodeSystemService', () => {
  let systemService: NodeSystemService;
  let mockOs: any;

  beforeEach(() => {
    systemService = new NodeSystemService();
    mockOs = require('os');
    jest.clearAllMocks();
  });

  describe('getCpuUsage', () => {
    it('should return 0 on first call (baseline)', async () => {
      mockOs.cpus.mockReturnValue([
        {
          times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 }
        },
        {
          times: { user: 800, nice: 0, sys: 400, idle: 8800, irq: 0 }
        }
      ]);

      const cpuUsage = await systemService.getCpuUsage();

      expect(cpuUsage).toBe(0);
      expect(mockOs.cpus).toHaveBeenCalledTimes(1);
    });

    it('should calculate CPU usage correctly on subsequent calls', async () => {
      // First call - baseline
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 }
        }
      ]);
      await systemService.getCpuUsage();

      // Second call - with increased usage
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1200, nice: 0, sys: 600, idle: 8700, irq: 0 }
        }
      ]);

      const cpuUsage = await systemService.getCpuUsage();

      expect(typeof cpuUsage).toBe('number');
      expect(cpuUsage).toBeGreaterThanOrEqual(0);
      expect(cpuUsage).toBeLessThanOrEqual(100);
    });

    it('should handle errors gracefully', async () => {
      mockOs.cpus.mockImplementation(() => {
        throw new Error('System error');
      });

      await expect(systemService.getCpuUsage()).rejects.toThrow('Failed to read CPU usage');
    });

    it('should return 0 when totalTick is 0', async () => {
      // First call
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 }
        }
      ]);
      await systemService.getCpuUsage();

      // Second call with same values (no change)
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 }
        }
      ]);

      const cpuUsage = await systemService.getCpuUsage();
      expect(cpuUsage).toBe(0);
    });

    it('should handle mismatched CPU core counts', async () => {
      // First call - 2 cores
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 }
        },
        {
          times: { user: 800, nice: 0, sys: 400, idle: 8800, irq: 0 }
        }
      ]);
      await systemService.getCpuUsage();

      // Second call - 1 core (hardware change scenario)
      mockOs.cpus.mockReturnValueOnce([
        {
          times: { user: 1200, nice: 0, sys: 600, idle: 8700, irq: 0 }
        }
      ]);

      const cpuUsage = await systemService.getCpuUsage();
      expect(typeof cpuUsage).toBe('number');
      expect(cpuUsage).toBeGreaterThanOrEqual(0);
      expect(cpuUsage).toBeLessThanOrEqual(100);
    });
  });

  describe('getRamUsage', () => {
    it('should calculate RAM usage correctly', async () => {
      const totalMemory = 8 * 1024 * 1024 * 1024; // 8GB
      const freeMemory = 2 * 1024 * 1024 * 1024;  // 2GB
      
      mockOs.totalmem.mockReturnValue(totalMemory);
      mockOs.freemem.mockReturnValue(freeMemory);

      const ramUsage = await systemService.getRamUsage();

      expect(ramUsage).toBe(75); // (8-2)/8 * 100 = 75%
      expect(mockOs.totalmem).toHaveBeenCalledTimes(1);
      expect(mockOs.freemem).toHaveBeenCalledTimes(1);
    });

    it('should return value between 0 and 100', async () => {
      mockOs.totalmem.mockReturnValue(1024);
      mockOs.freemem.mockReturnValue(512);

      const ramUsage = await systemService.getRamUsage();

      expect(ramUsage).toBeGreaterThanOrEqual(0);
      expect(ramUsage).toBeLessThanOrEqual(100);
    });

    it('should handle errors gracefully', async () => {
      mockOs.totalmem.mockImplementation(() => {
        throw new Error('Memory read error');
      });

      await expect(systemService.getRamUsage()).rejects.toThrow('Failed to read RAM usage');
    });

    it('should handle edge case with no free memory', async () => {
      mockOs.totalmem.mockReturnValue(1024);
      mockOs.freemem.mockReturnValue(0);

      const ramUsage = await systemService.getRamUsage();
      expect(ramUsage).toBe(100);
    });

    it('should handle edge case with all memory free', async () => {
      mockOs.totalmem.mockReturnValue(1024);
      mockOs.freemem.mockReturnValue(1024);

      const ramUsage = await systemService.getRamUsage();
      expect(ramUsage).toBe(0);
    });
  });
});

describe('SystemMonitor', () => {
  let systemMonitor: SystemMonitor;
  let mockSystemService: jest.Mocked<SystemService>;
  let config: SystemMonitorConfig;

  beforeEach(() => {
    config = {
      monitoringInterval: 1000
    };

    mockSystemService = {
      getCpuUsage: jest.fn(),
      getRamUsage: jest.fn(),
    };

    systemMonitor = new SystemMonitor(config, mockSystemService);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    systemMonitor.stopMonitoring();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(systemMonitor.isMonitoringActive()).toBe(false);
      expect(systemMonitor.getCurrentMetrics()).toBeNull();
    });

    it('should use NodeSystemService by default', () => {
      const defaultMonitor = new SystemMonitor(config);
      expect(defaultMonitor).toBeInstanceOf(SystemMonitor);
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25.5);
      mockSystemService.getRamUsage.mockResolvedValue(60.2);

      await systemMonitor.startMonitoring();

      expect(systemMonitor.isMonitoringActive()).toBe(true);
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(1);
      expect(mockSystemService.getRamUsage).toHaveBeenCalledTimes(1);
    });

    it('should not start monitoring if already running', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25.5);
      mockSystemService.getRamUsage.mockResolvedValue(60.2);

      await systemMonitor.startMonitoring();
      await systemMonitor.startMonitoring(); // Second call

      expect(systemMonitor.isMonitoringActive()).toBe(true);
      // Should only be called once from the first start
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during startup', async () => {
      mockSystemService.getCpuUsage.mockRejectedValue(new Error('CPU read failed'));

      await expect(systemMonitor.startMonitoring()).rejects.toThrow('CPU read failed');
      expect(systemMonitor.isMonitoringActive()).toBe(false);
    });

    it('should collect metrics at the configured interval', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(30);
      mockSystemService.getRamUsage.mockResolvedValue(70);

      await systemMonitor.startMonitoring();

      // Initial call
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(1);
      expect(mockSystemService.getRamUsage).toHaveBeenCalledTimes(1);

      // Advance timer by interval
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Allow async callbacks to execute

      // Should have been called again
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(2);
      expect(mockSystemService.getRamUsage).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during periodic collection', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(30);
      mockSystemService.getRamUsage.mockResolvedValue(70);

      await systemMonitor.startMonitoring();

      // Make subsequent calls fail
      mockSystemService.getCpuUsage.mockRejectedValue(new Error('Periodic error'));

      // Advance timer - should not crash
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Monitoring should still be active
      expect(systemMonitor.isMonitoringActive()).toBe(true);
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring successfully', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25.5);
      mockSystemService.getRamUsage.mockResolvedValue(60.2);

      await systemMonitor.startMonitoring();
      expect(systemMonitor.isMonitoringActive()).toBe(true);

      systemMonitor.stopMonitoring();
      expect(systemMonitor.isMonitoringActive()).toBe(false);
    });

    it('should not fail if monitoring is not running', () => {
      expect(() => systemMonitor.stopMonitoring()).not.toThrow();
      expect(systemMonitor.isMonitoringActive()).toBe(false);
    });

    it('should clear the monitoring timer', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25.5);
      mockSystemService.getRamUsage.mockResolvedValue(60.2);

      await systemMonitor.startMonitoring();
      systemMonitor.stopMonitoring();

      // Advance timer - should not trigger collection
      const initialCallCount = mockSystemService.getCpuUsage.mock.calls.length;
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('getCurrentMetrics', () => {
    it('should return null initially', () => {
      expect(systemMonitor.getCurrentMetrics()).toBeNull();
    });

    it('should return current metrics after collection', async () => {
      const cpuUsage = 25.5;
      const ramUsage = 60.2;
      
      mockSystemService.getCpuUsage.mockResolvedValue(cpuUsage);
      mockSystemService.getRamUsage.mockResolvedValue(ramUsage);

      await systemMonitor.startMonitoring();

      const metrics = systemMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.cpuUsage).toBe(cpuUsage);
      expect(metrics!.memoryUsage).toBe(ramUsage);
      expect(metrics!.diskUsage).toBeUndefined(); // Optional field - not yet implemented
      expect(typeof metrics!.timestamp).toBe('string');
    });
  });

  describe('getCpuUsage', () => {
    it('should delegate to system service', async () => {
      const expectedUsage = 42.5;
      mockSystemService.getCpuUsage.mockResolvedValue(expectedUsage);

      const result = await systemMonitor.getCpuUsage();

      expect(result).toBe(expectedUsage);
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRamUsage', () => {
    it('should delegate to system service', async () => {
      const expectedUsage = 75.3;
      mockSystemService.getRamUsage.mockResolvedValue(expectedUsage);

      const result = await systemMonitor.getRamUsage();

      expect(result).toBe(expectedUsage);
      expect(mockSystemService.getRamUsage).toHaveBeenCalledTimes(1);
    });
  });

  describe('isMonitoringActive', () => {
    it('should return false initially', () => {
      expect(systemMonitor.isMonitoringActive()).toBe(false);
    });

    it('should return true when monitoring is active', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25);
      mockSystemService.getRamUsage.mockResolvedValue(60);

      await systemMonitor.startMonitoring();
      expect(systemMonitor.isMonitoringActive()).toBe(true);
    });

    it('should return false after stopping', async () => {
      mockSystemService.getCpuUsage.mockResolvedValue(25);
      mockSystemService.getRamUsage.mockResolvedValue(60);

      await systemMonitor.startMonitoring();
      systemMonitor.stopMonitoring();
      expect(systemMonitor.isMonitoringActive()).toBe(false);
    });
  });

  describe('configuration validation', () => {
    it('should work with different monitoring intervals', async () => {
      const shortIntervalConfig = { monitoringInterval: 500 };
      const shortIntervalMonitor = new SystemMonitor(shortIntervalConfig, mockSystemService);

      mockSystemService.getCpuUsage.mockResolvedValue(30);
      mockSystemService.getRamUsage.mockResolvedValue(70);

      await shortIntervalMonitor.startMonitoring();

      // Advance by the short interval
      jest.advanceTimersByTime(500);
      await Promise.resolve();

      // Should have triggered another collection
      expect(mockSystemService.getCpuUsage).toHaveBeenCalledTimes(2);

      shortIntervalMonitor.stopMonitoring();
    });
  });
});
