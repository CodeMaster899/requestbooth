import { useEffect, useState, useCallback } from 'react';
import { desktopNotifications } from '@/lib/desktopNotifications';

export interface NotificationHookState {
  isAvailable: boolean;
  hasPermission: boolean;
  isInitialized: boolean;
}

export function useDesktopNotifications() {
  const [state, setState] = useState<NotificationHookState>({
    isAvailable: desktopNotifications.isAvailable,
    hasPermission: desktopNotifications.hasPermission,
    isInitialized: desktopNotifications.isInitialized,
  });

  // Initialize notifications on mount
  useEffect(() => {
    const initialize = async () => {
      if (desktopNotifications.isAvailable && !desktopNotifications.isInitialized) {
        const hasPermission = await desktopNotifications.initialize();
        setState({
          isAvailable: true,
          hasPermission,
          isInitialized: true,
        });
      }
    };

    initialize();
  }, []);

  // Update state when service changes
  useEffect(() => {
    const updateState = () => {
      setState({
        isAvailable: desktopNotifications.isAvailable,
        hasPermission: desktopNotifications.hasPermission,
        isInitialized: desktopNotifications.isInitialized,
      });
    };

    // Poll for changes periodically (in case permissions change)
    const interval = setInterval(updateState, 5000);
    updateState(); // Initial call

    return () => clearInterval(interval);
  }, []);

  // Notification methods
  const sendNotification = useCallback(async (title: string, body?: string, options?: { icon?: string; sound?: boolean }) => {
    return desktopNotifications.sendNotification({
      title,
      body,
      icon: options?.icon,
      sound: options?.sound,
    });
  }, []);

  const notifyNewRequest = useCallback(async (songTitle: string, artist?: string) => {
    return desktopNotifications.notifyNewRequest(songTitle, artist);
  }, []);

  const notifyRequestAccepted = useCallback(async (songTitle: string) => {
    return desktopNotifications.notifyRequestAccepted(songTitle);
  }, []);

  const notifyRequestDeclined = useCallback(async (songTitle: string, reason?: string) => {
    return desktopNotifications.notifyRequestDeclined(songTitle, reason);
  }, []);

  const notifySystemStatus = useCallback(async (status: 'online' | 'offline' | 'maintenance') => {
    return desktopNotifications.notifySystemStatus(status);
  }, []);

  const notifyUpdateAvailable = useCallback(async (version: string) => {
    return desktopNotifications.notifyUpdateAvailable(version);
  }, []);

  const notifyUpdateInstalled = useCallback(async (version: string) => {
    return desktopNotifications.notifyUpdateInstalled(version);
  }, []);

  return {
    ...state,
    sendNotification,
    notifyNewRequest,
    notifyRequestAccepted,
    notifyRequestDeclined,
    notifySystemStatus,
    notifyUpdateAvailable,
    notifyUpdateInstalled,
  };
}