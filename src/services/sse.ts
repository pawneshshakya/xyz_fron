import { useEffect, useState } from 'react';
import { API_URL } from '../config/config';

// Simple SSE Hook using EventSource (React Native might need polyfill like 'react-native-event-source' or 'event-source-polyfill')
// For this MVP code, we assume standard EventSource API or polyfill is available.

export const useMatchUpdates = (matchId: string) => {
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Note: React Native requires full URL
    // const url = `${API_URL}/matches/sse/${matchId}`;
    // Using a simpler approach for MVP example.
    
    // In React Native, use:
    // import EventSource from "react-native-sse";
    // const es = new EventSource(url);
    
    // Stub implementation to show logic
    console.log(`Connecting to SSE for match ${matchId}`);
    
    return () => {
      // es.close();
      console.log('Closing SSE connection');
    };
  }, [matchId]);

  return { data, connected };
};
