import { useState, useRef, useCallback, useEffect } from 'react';
import { createWebSocketService } from '../services/websocket';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef(createWebSocketService(url));

  useEffect(() => {
    const ws = wsRef.current;

    ws.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    ws.on('disconnected', () => {
      setIsConnected(false);
    });

    ws.on('error', (err: Error) => {
      setError(err);
    });

    ws.on('maxReconnectAttemptsReached', () => {
      setError(new Error('Maximum reconnection attempts reached'));
    });

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [url]);

  const send = useCallback((type: string, payload: any) => {
    wsRef.current.send(type, payload);
  }, []);

  return {
    isConnected,
    error,
    send,
    on: wsRef.current.on.bind(wsRef.current),
    off: wsRef.current.off.bind(wsRef.current),
  };
};
