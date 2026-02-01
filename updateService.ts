import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { desktopNotifications } from './desktopNotifications';

export interface UpdateInfo {
  available: boolean;
  version?: string;
  body?: string;
  date?: string;
  currentVersion?: string;
}

export interface UpdateProgress {
  chunkLength: number;
  contentLength?: number;
  downloaded: number;
  percentage: number;
}

export class UpdateService {
  private static instance: UpdateService;
  private isChecking = false;
  private isUpdating = false;
  private updateCallbacks: ((info: UpdateInfo) => void)[] = [];
  private progressCallbacks: ((progress: UpdateProgress) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  // Check if we're running in Tauri
  private isTauri(): boolean {
    return typeof window !== 'undefined' && 
           window.__TAURI__ !== undefined;
  }

  // Subscribe to update events
  onUpdateAvailable(callback: (info: UpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  onUpdateProgress(callback: (progress: UpdateProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  onUpdateError(callback: (error: string) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Check for updates
  async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.isTauri()) {
      return { available: false };
    }

    if (this.isChecking) {
      throw new Error('Update check already in progress');
    }

    this.isChecking = true;

    try {
      const update = await check();
      
      const updateInfo: UpdateInfo = {
        available: update?.available || false,
        version: update?.version,
        body: update?.body,
        date: update?.date,
        currentVersion: update?.currentVersion,
      };

      // Notify subscribers
      this.updateCallbacks.forEach(callback => callback(updateInfo));

      // Send desktop notification for available updates
      if (updateInfo.available && updateInfo.version) {
        try {
          await desktopNotifications.notifyUpdateAvailable(updateInfo.version);
        } catch (error) {
          console.error('Failed to send update notification:', error);
        }
      }

      return updateInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorCallbacks.forEach(callback => callback(errorMessage));
      throw error;
    } finally {
      this.isChecking = false;
    }
  }

  // Download and install update
  async downloadAndInstall(): Promise<void> {
    if (!this.isTauri()) {
      throw new Error('Updates are only available in the desktop app');
    }

    if (this.isUpdating) {
      throw new Error('Update already in progress');
    }

    this.isUpdating = true;

    try {
      const update = await check();
      
      if (!update?.available) {
        throw new Error('No update available');
      }

      // Track download progress
      let downloaded = 0;
      let contentLength = 0;
      
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            downloaded = 0;
            contentLength = event.data?.contentLength || 0;
            this.progressCallbacks.forEach(callback => 
              callback({
                chunkLength: 0,
                contentLength,
                downloaded: 0,
                percentage: 0
              })
            );
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const percentage = contentLength > 0 
              ? (downloaded / contentLength) * 100 
              : 0;
            this.progressCallbacks.forEach(callback =>
              callback({
                chunkLength: event.data.chunkLength,
                contentLength,
                downloaded,
                percentage
              })
            );
            break;
          case 'Finished':
            this.progressCallbacks.forEach(callback =>
              callback({
                chunkLength: 0,
                contentLength,
                downloaded,
                percentage: 100
              })
            );
            break;
        }
      });

      // Send notification about successful installation
      if (update.version) {
        try {
          await desktopNotifications.notifyUpdateInstalled(update.version);
        } catch (error) {
          console.error('Failed to send update installed notification:', error);
        }
      }

      // Restart the app to complete the update
      await relaunch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      this.errorCallbacks.forEach(callback => callback(errorMessage));
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Get current status
  get status() {
    return {
      isChecking: this.isChecking,
      isUpdating: this.isUpdating,
      isTauri: this.isTauri()
    };
  }

  // Auto-check for updates on app start
  async autoCheckForUpdates(): Promise<void> {
    if (!this.isTauri()) {
      return;
    }

    try {
      // Check for updates 30 seconds after app start
      setTimeout(async () => {
        try {
          await this.checkForUpdates();
        } catch (error) {
          console.error('Auto-update check failed:', error);
        }
      }, 30000);

      // Then check every 4 hours
      setInterval(async () => {
        try {
          await this.checkForUpdates();
        } catch (error) {
          console.error('Periodic update check failed:', error);
        }
      }, 4 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to setup auto-update checks:', error);
    }
  }
}

// Export a singleton instance
export const updateService = UpdateService.getInstance();