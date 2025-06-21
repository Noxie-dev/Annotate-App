import { WebRTCConfig } from '@/types';

/**
 * Production-ready WebRTC configuration with STUN/TURN servers
 * 
 * STUN servers help with NAT traversal by discovering public IP addresses
 * TURN servers act as relays when direct peer-to-peer connection fails
 */

// Google's free STUN servers (recommended for production)
const GOOGLE_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302'
];

// Additional reliable STUN servers
const ADDITIONAL_STUN_SERVERS = [
  'stun:stun.stunprotocol.org:3478',
  'stun:stun.voiparound.com',
  'stun:stun.voipbuster.com'
];

/**
 * Default WebRTC configuration for development
 * Uses only STUN servers (no TURN relay)
 */
export const DEFAULT_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    {
      urls: GOOGLE_STUN_SERVERS
    },
    {
      urls: ADDITIONAL_STUN_SERVERS
    }
  ],
  iceTransportPolicy: 'all',
  iceCandidatePoolSize: 10
};

/**
 * Production WebRTC configuration with TURN server
 * Replace with your actual TURN server credentials
 */
export const PRODUCTION_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    // STUN servers (free)
    {
      urls: GOOGLE_STUN_SERVERS
    },
    // TURN server (requires credentials)
    // Uncomment and configure when you have a TURN server
    /*
    {
      urls: [
        'turn:your-turn-server.com:3478',
        'turns:your-turn-server.com:5349'
      ],
      username: import.meta.env.VITE_TURN_USERNAME || 'your-turn-username',
      credential: import.meta.env.VITE_TURN_PASSWORD || 'your-turn-password'
    }
    */
  ],
  iceTransportPolicy: 'all',
  iceCandidatePoolSize: 10
};

/**
 * Configuration for testing with forced TURN relay
 * Useful for testing TURN server functionality
 */
export const TURN_ONLY_CONFIG: WebRTCConfig = {
  iceServers: [
    // Only TURN servers, no STUN
    /*
    {
      urls: [
        'turn:your-turn-server.com:3478',
        'turns:your-turn-server.com:5349'
      ],
      username: import.meta.env.VITE_TURN_USERNAME || 'your-turn-username',
      credential: import.meta.env.VITE_TURN_PASSWORD || 'your-turn-password'
    }
    */
  ],
  iceTransportPolicy: 'relay', // Force TURN relay
  iceCandidatePoolSize: 10
};

/**
 * Get WebRTC configuration based on environment
 */
export function getWebRTCConfig(): WebRTCConfig {
  const environment = import.meta.env.MODE || 'development';

  switch (environment) {
    case 'production':
      return PRODUCTION_WEBRTC_CONFIG;
    case 'test':
      return TURN_ONLY_CONFIG;
    default:
      return DEFAULT_WEBRTC_CONFIG;
  }
}

/**
 * Validate WebRTC configuration
 */
export function validateWebRTCConfig(config: WebRTCConfig): boolean {
  if (!config.iceServers || config.iceServers.length === 0) {
    console.warn('WebRTC config has no ICE servers');
    return false;
  }

  let hasStun = false;
  let hasTurn = false;

  config.iceServers.forEach(server => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    urls.forEach(url => {
      if (url.startsWith('stun:')) {
        hasStun = true;
      } else if (url.startsWith('turn:') || url.startsWith('turns:')) {
        hasTurn = true;
        if (!server.username || !server.credential) {
          console.warn('TURN server configured without credentials');
        }
      }
    });
  });

  if (!hasStun) {
    console.warn('WebRTC config has no STUN servers - NAT traversal may fail');
  }

  if (!hasTurn) {
    console.info('WebRTC config has no TURN servers - connections may fail behind restrictive firewalls');
  }

  return true;
}

/**
 * Test ICE server connectivity
 */
export async function testICEServers(config: WebRTCConfig): Promise<{
  stun: boolean;
  turn: boolean;
  errors: string[];
}> {
  const results = {
    stun: false,
    turn: false,
    errors: [] as string[]
  };

  try {
    const pc = new RTCPeerConnection(config);
    
    // Create a data channel to trigger ICE gathering
    pc.createDataChannel('test');
    
    // Create offer to start ICE gathering
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pc.close();
        results.errors.push('ICE gathering timeout');
        resolve(results);
      }, 10000);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          
          if (candidate.includes('typ srflx')) {
            results.stun = true;
          } else if (candidate.includes('typ relay')) {
            results.turn = true;
          }
        } else {
          // ICE gathering complete
          clearTimeout(timeout);
          pc.close();
          resolve(results);
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          pc.close();
          resolve(results);
        }
      };
    });
  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return results;
  }
}

/**
 * Get recommended TURN server providers
 */
export const TURN_SERVER_PROVIDERS = {
  twilio: {
    name: 'Twilio',
    description: 'Enterprise-grade TURN service with global infrastructure',
    website: 'https://www.twilio.com/stun-turn',
    pricing: 'Pay-per-use'
  },
  xirsys: {
    name: 'Xirsys',
    description: 'Specialized WebRTC infrastructure provider',
    website: 'https://xirsys.com/',
    pricing: 'Subscription-based'
  },
  metered: {
    name: 'Metered',
    description: 'Simple and affordable TURN server service',
    website: 'https://www.metered.ca/tools/openrelay/',
    pricing: 'Free tier available'
  },
  coturn: {
    name: 'CoTURN (Self-hosted)',
    description: 'Open-source TURN server you can host yourself',
    website: 'https://github.com/coturn/coturn',
    pricing: 'Free (hosting costs apply)'
  }
};

/**
 * Environment-specific configuration helpers
 */
export const CONFIG_HELPERS = {
  /**
   * Check if TURN credentials are configured
   */
  hasTurnCredentials(): boolean {
    return !!(import.meta.env.VITE_TURN_USERNAME && import.meta.env.VITE_TURN_PASSWORD);
  },

  /**
   * Get signaling server URL from environment
   */
  getSignalingServerUrl(): string {
    return import.meta.env.VITE_SIGNALING_SERVER_URL || 'ws://localhost:3001';
  },

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return import.meta.env.MODE === 'development';
  },

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return import.meta.env.MODE === 'production';
  }
};
