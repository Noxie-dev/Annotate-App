import { describe, it, expect } from 'vitest';
import {
  getWebRTCConfig,
  CONFIG_HELPERS,
  validateWebRTCConfig,
  DEFAULT_WEBRTC_CONFIG
} from '@/config/webrtc-config';

describe('WebRTC Configuration - Integration Tests', () => {

  it('should load WebRTC configuration without process.env errors', () => {
    // This test verifies that the configuration can be loaded without
    // "ReferenceError: process is not defined" errors
    expect(() => {
      const config = getWebRTCConfig();
      expect(config).toBeDefined();
      expect(config.iceServers).toBeDefined();
      expect(config.iceTransportPolicy).toBeDefined();
      expect(config.iceCandidatePoolSize).toBeDefined();
    }).not.toThrow();
  });

  it('should load CONFIG_HELPERS without process.env errors', () => {
    // This test verifies that all CONFIG_HELPERS functions can be called
    // without "ReferenceError: process is not defined" errors
    expect(() => {
      const signalingUrl = CONFIG_HELPERS.getSignalingServerUrl();
      const hasTurnCreds = CONFIG_HELPERS.hasTurnCredentials();
      const isDev = CONFIG_HELPERS.isDevelopment();
      const isProd = CONFIG_HELPERS.isProduction();

      expect(typeof signalingUrl).toBe('string');
      expect(typeof hasTurnCreds).toBe('boolean');
      expect(typeof isDev).toBe('boolean');
      expect(typeof isProd).toBe('boolean');
    }).not.toThrow();
  });

  it('should validate WebRTC configuration without errors', () => {
    // This test verifies that validation works with the current environment
    expect(() => {
      const config = getWebRTCConfig();
      const isValid = validateWebRTCConfig(config);
      expect(typeof isValid).toBe('boolean');
    }).not.toThrow();
  });

  it('should handle default signaling server URL', () => {
    // Test that the signaling server URL defaults work
    const url = CONFIG_HELPERS.getSignalingServerUrl();
    expect(url).toMatch(/^wss?:\/\//); // Should be a valid WebSocket URL
  });
});
