import { useEffect, useState, useCallback } from 'react';
import { updateService, type UpdateInfo, type UpdateProgress } from '@/lib/updateService';

export interface UpdateState {
  isChecking: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  downloadProgress: UpdateProgress | null;
  error: string | null;
  isTauri: boolean;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    isChecking: false,
    isUpdating: false,
    updateAvailable: false,
    updateInfo: null,
    downloadProgress: null,
    error: null,
    isTauri: updateService.status.isTauri,
  });

  // Update state when service status changes
  const updateServiceStatus = useCallback(() => {
    const status = updateService.status;
    setState(prev => ({
      ...prev,
      isChecking: status.isChecking,
      isUpdating: status.isUpdating,
      isTauri: status.isTauri,
    }));
  }, []);

  // Setup event listeners
  useEffect(() => {
    const unsubscribeUpdate = updateService.onUpdateAvailable((info) => {
      setState(prev => ({
        ...prev,
        updateAvailable: info.available,
        updateInfo: info,
        error: null,
      }));
    });

    const unsubscribeProgress = updateService.onUpdateProgress((progress) => {
      setState(prev => ({
        ...prev,
        downloadProgress: progress,
      }));
    });

    const unsubscribeError = updateService.onUpdateError((error) => {
      setState(prev => ({
        ...prev,
        error,
        isChecking: false,
        isUpdating: false,
      }));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeProgress();
      unsubscribeError();
    };
  }, []);

  // Periodically update service status
  useEffect(() => {
    const interval = setInterval(updateServiceStatus, 1000);
    updateServiceStatus(); // Initial call
    return () => clearInterval(interval);
  }, [updateServiceStatus]);

  // Check for updates manually
  const checkForUpdates = useCallback(async () => {
    if (!state.isTauri) {
      setState(prev => ({
        ...prev,
        error: 'Updates are only available in the desktop app',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      error: null,
    }));

    try {
      await updateService.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      // Error will be handled by the error callback
    }
  }, [state.isTauri]);

  // Download and install update
  const downloadAndInstall = useCallback(async () => {
    if (!state.isTauri) {
      setState(prev => ({
        ...prev,
        error: 'Updates are only available in the desktop app',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      error: null,
      downloadProgress: null,
    }));

    try {
      await updateService.downloadAndInstall();
    } catch (error) {
      console.error('Failed to download and install update:', error);
      // Error will be handled by the error callback
    }
  }, [state.isTauri]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    setState(prev => ({
      ...prev,
      updateAvailable: false,
      updateInfo: null,
    }));
  }, []);

  // Initialize auto-check on first render (only in Tauri)
  useEffect(() => {
    if (state.isTauri) {
      updateService.autoCheckForUpdates();
    }
  }, [state.isTauri]);

  return {
    ...state,
    checkForUpdates,
    downloadAndInstall,
    clearError,
    dismissUpdate,
  };
}