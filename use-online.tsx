import { useState, useEffect, useCallback } from 'react';
import { desktopNotifications } from '@/lib/desktopNotifications';

// Extend Window interface for Tauri
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

// Check if we're in a Tauri environment
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState<boolean | null>(null);

  const notifyStatusChange = useCallback(async (online: boolean) => {
    // Only notify if status actually changed and we have a previous status
    if (lastNotifiedStatus !== null && lastNotifiedStatus !== online) {
      try {
        if (online) {
          await desktopNotifications.notifySystemStatus('online');
        } else {
          await desktopNotifications.notifySystemStatus('offline');
        }
      } catch (error) {
        console.error('Failed to send status notification:', error);
      }
    }
    setLastNotifiedStatus(online);
  }, [lastNotifiedStatus]);

  const checkOnlineStatus = useCallback(async () => {
    setIsChecking(true);
    
    try {
      let online = false;
      
      if (isTauri) {
        // Use Tauri's invoke for desktop app
        const { invoke } = await import('@tauri-apps/api/core');
        online = await invoke<boolean>('is_online');
      } else {
        // Web-based online check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch('/api/system/status', {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          online = response.ok;
        } catch (error) {
          clearTimeout(timeoutId);
          // If request fails, we're likely offline
          online = false;
        }
      }
      
      setIsOnline(online);
      await notifyStatusChange(online);
    } catch (error) {
      console.error('Error checking online status:', error);
      setIsOnline(false);
      await notifyStatusChange(false);
    } finally {
      setIsChecking(false);
    }
  }, [notifyStatusChange]);

  useEffect(() => {
    // Initial check
    checkOnlineStatus();

    // Set up listeners for browser online/offline events
    const handleOnline = async () => {
      setIsOnline(true);
      await notifyStatusChange(true);
      checkOnlineStatus(); // Double-check with server
    };
    
    const handleOffline = async () => {
      setIsOnline(false);
      await notifyStatusChange(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic online check (every 30 seconds)
    const interval = setInterval(checkOnlineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isChecking,
    checkOnlineStatus
  };
}