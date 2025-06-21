/**
 * WebRTC Error Handler Service
 * Provides comprehensive error handling and recovery for WebRTC operations
 */

export interface WebRTCError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userMessage: string;
  technicalDetails?: string;
  suggestedActions?: string[];
}

export class WebRTCErrorHandler {
  private static instance: WebRTCErrorHandler;
  private errorHistory: WebRTCError[] = [];
  private maxHistorySize = 50;

  static getInstance(): WebRTCErrorHandler {
    if (!WebRTCErrorHandler.instance) {
      WebRTCErrorHandler.instance = new WebRTCErrorHandler();
    }
    return WebRTCErrorHandler.instance;
  }

  /**
   * Handle and categorize WebRTC errors
   */
  handleError(error: any, context?: string): WebRTCError {
    const webrtcError = this.categorizeError(error, context);
    this.logError(webrtcError);
    return webrtcError;
  }

  /**
   * Categorize errors based on type and provide user-friendly messages
   */
  private categorizeError(error: any, context?: string): WebRTCError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorName = error?.name || 'UnknownError';

    // Media access errors
    if (errorName === 'NotAllowedError' || errorMessage.includes('Permission denied')) {
      return {
        code: 'MEDIA_PERMISSION_DENIED',
        message: errorMessage,
        severity: 'high',
        recoverable: true,
        userMessage: 'Camera and microphone access was denied. Please allow access and try again.',
        technicalDetails: `${errorName}: ${errorMessage}`,
        suggestedActions: [
          'Click the camera/microphone icon in your browser address bar',
          'Select "Allow" for camera and microphone permissions',
          'Refresh the page and try again'
        ]
      };
    }

    if (errorName === 'NotFoundError' || errorMessage.includes('Requested device not found')) {
      return {
        code: 'MEDIA_DEVICE_NOT_FOUND',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        userMessage: 'Camera or microphone not found. Please check your devices.',
        technicalDetails: `${errorName}: ${errorMessage}`,
        suggestedActions: [
          'Check that your camera and microphone are connected',
          'Try refreshing the page',
          'Check device settings in your operating system'
        ]
      };
    }

    if (errorName === 'NotReadableError' || errorMessage.includes('Could not start video source')) {
      return {
        code: 'MEDIA_DEVICE_IN_USE',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        userMessage: 'Your camera or microphone is being used by another application.',
        technicalDetails: `${errorName}: ${errorMessage}`,
        suggestedActions: [
          'Close other applications that might be using your camera/microphone',
          'Try refreshing the page',
          'Restart your browser'
        ]
      };
    }

    // Network and connection errors
    if (errorMessage.includes('ICE') || errorMessage.includes('connection failed')) {
      return {
        code: 'ICE_CONNECTION_FAILED',
        message: errorMessage,
        severity: 'high',
        recoverable: true,
        userMessage: 'Connection failed. This might be due to network restrictions.',
        technicalDetails: `ICE Connection Error: ${errorMessage}`,
        suggestedActions: [
          'Check your internet connection',
          'Try connecting from a different network',
          'Contact your network administrator if on a corporate network'
        ]
      };
    }

    if (errorMessage.includes('STUN') || errorMessage.includes('TURN')) {
      return {
        code: 'STUN_TURN_ERROR',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        userMessage: 'Network configuration issue. Connection may be unstable.',
        technicalDetails: `STUN/TURN Error: ${errorMessage}`,
        suggestedActions: [
          'Try again in a few moments',
          'Check your firewall settings',
          'Try connecting from a different network'
        ]
      };
    }

    // Signaling errors
    if (errorMessage.includes('signaling') || errorMessage.includes('websocket')) {
      return {
        code: 'SIGNALING_ERROR',
        message: errorMessage,
        severity: 'high',
        recoverable: true,
        userMessage: 'Connection to the server failed. Please try again.',
        technicalDetails: `Signaling Error: ${errorMessage}`,
        suggestedActions: [
          'Check your internet connection',
          'Refresh the page',
          'Try again in a few moments'
        ]
      };
    }

    // Browser compatibility errors
    if (errorMessage.includes('not supported') || errorMessage.includes('undefined')) {
      return {
        code: 'BROWSER_NOT_SUPPORTED',
        message: errorMessage,
        severity: 'critical',
        recoverable: false,
        userMessage: 'Your browser does not support video calling. Please use a modern browser.',
        technicalDetails: `Browser Compatibility: ${errorMessage}`,
        suggestedActions: [
          'Update your browser to the latest version',
          'Try using Chrome, Firefox, Safari, or Edge',
          'Enable WebRTC in your browser settings'
        ]
      };
    }

    // Generic WebRTC errors
    if (context === 'webrtc' || errorMessage.includes('peer') || errorMessage.includes('RTC')) {
      return {
        code: 'WEBRTC_GENERIC_ERROR',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        userMessage: 'A connection error occurred. Please try again.',
        technicalDetails: `WebRTC Error: ${errorMessage}`,
        suggestedActions: [
          'Try ending and starting the call again',
          'Refresh the page',
          'Check your internet connection'
        ]
      };
    }

    // Unknown errors
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      severity: 'medium',
      recoverable: true,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalDetails: `Unknown Error: ${errorMessage}`,
      suggestedActions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    };
  }

  /**
   * Log error to history and console
   */
  private logError(error: WebRTCError): void {
    // Add to history
    this.errorHistory.unshift({
      ...error,
      message: `${new Date().toISOString()}: ${error.message}`
    });

    // Limit history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }

    // Log to console based on severity
    const logMessage = `[WebRTC Error] ${error.code}: ${error.userMessage}`;
    const technicalMessage = error.technicalDetails || error.message;

    switch (error.severity) {
      case 'critical':
        console.error(logMessage, technicalMessage);
        break;
      case 'high':
        console.error(logMessage, technicalMessage);
        break;
      case 'medium':
        console.warn(logMessage, technicalMessage);
        break;
      case 'low':
        console.info(logMessage, technicalMessage);
        break;
    }
  }

  /**
   * Get error history
   */
  getErrorHistory(): WebRTCError[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Check if error is recoverable and suggest recovery actions
   */
  getRecoveryActions(errorCode: string): string[] {
    const error = this.errorHistory.find(e => e.code === errorCode);
    return error?.suggestedActions || [];
  }

  /**
   * Attempt automatic recovery for certain error types
   */
  async attemptRecovery(error: WebRTCError, retryCallback?: () => Promise<void>): Promise<boolean> {
    if (!error.recoverable) {
      return false;
    }

    switch (error.code) {
      case 'MEDIA_PERMISSION_DENIED':
        // Can't automatically recover from permission denial
        return false;

      case 'MEDIA_DEVICE_NOT_FOUND':
      case 'MEDIA_DEVICE_IN_USE':
        // Wait a bit and retry
        if (retryCallback) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            await retryCallback();
            return true;
          } catch (retryError) {
            this.handleError(retryError, 'recovery_attempt');
            return false;
          }
        }
        return false;

      case 'ICE_CONNECTION_FAILED':
      case 'STUN_TURN_ERROR':
        // Wait and retry with exponential backoff
        if (retryCallback) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          try {
            await retryCallback();
            return true;
          } catch (retryError) {
            this.handleError(retryError, 'recovery_attempt');
            return false;
          }
        }
        return false;

      case 'SIGNALING_ERROR':
        // Attempt to reconnect signaling
        if (retryCallback) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          try {
            await retryCallback();
            return true;
          } catch (retryError) {
            this.handleError(retryError, 'recovery_attempt');
            return false;
          }
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Generate error report for debugging
   */
  generateErrorReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      webrtcSupport: {
        rtcPeerConnection: !!window.RTCPeerConnection,
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
      },
      errorHistory: this.errorHistory.slice(0, 10), // Last 10 errors
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const webrtcErrorHandler = WebRTCErrorHandler.getInstance();
