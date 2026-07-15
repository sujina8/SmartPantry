import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Connects to a Django Channels WebSocket endpoint and exposes the latest
 * message plus connection status. Reconnects automatically with backoff if
 * the connection drops (e.g. server restart during development).
 *
 * ASSUMPTION: token is stored in localStorage under 'access_token' (matches
 * the JWT interceptor pattern used in services/api.js). Adjust if your
 * AuthContext stores it differently (e.g. in context state or a cookie).
 *
 * ASSUMPTION: the backend WebSocket route is ws/notifications/ — confirm
 * this against notification/routing.py and change the path below if it
 * differs.
 */
export default function useWebSocket(path = 'ws/notifications/') {
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = 'localhost:8000'; // adjust if backend runs elsewhere
    const socket = new WebSocket(`${protocol}://${host}/${path}?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    socket.onclose = () => {
      setIsConnected(false);
      // Reconnect with simple backoff, capped at 10s
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
      reconnectAttempts.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch {
        // ignore malformed messages
      }
    };
  }, [path]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };  
  }, [connect]);

  return { lastMessage, isConnected };
}