import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  sound?: boolean;
  urgent?: boolean;
}

export class DesktopNotificationService {
  private static instance: DesktopNotificationService;
  private permissionGranted: boolean = false;
  private initialized: boolean = false;

  static getInstance(): DesktopNotificationService {
    if (!DesktopNotificationService.instance) {
      DesktopNotificationService.instance = new DesktopNotificationService();
    }
    return DesktopNotificationService.instance;
  }

  // Check if we're running in Tauri
  private isTauri(): boolean {
    return typeof window !== 'undefined' && 
           window.__TAURI__ !== undefined;
  }

  // Initialize notification permissions
  async initialize(): Promise<boolean> {
    if (!this.isTauri()) {
      console.log('Notifications not available in web environment');
      return false;
    }

    if (this.initialized) {
      return this.permissionGranted;
    }

    try {
      // Check if permission is already granted
      this.permissionGranted = await isPermissionGranted();
      
      // If not granted, request permission
      if (!this.permissionGranted) {
        const permission = await requestPermission();
        this.permissionGranted = permission === 'granted';
      }

      this.initialized = true;
      console.log('Desktop notifications initialized:', this.permissionGranted ? 'enabled' : 'disabled');
      return this.permissionGranted;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      this.initialized = true;
      return false;
    }
  }

  // Send a notification
  async sendNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.isTauri()) {
      console.log('Notification would be sent:', options);
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    try {
      await sendNotification({
        title: options.title,
        body: options.body || '',
        icon: options.icon,
      });
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  // Predefined notification types for RequestBooth
  async notifyNewRequest(songTitle: string, artist?: string): Promise<boolean> {
    const body = artist ? `${songTitle} by ${artist}` : songTitle;
    return this.sendNotification({
      title: 'New Song Request',
      body: `Request: ${body}`,
      sound: true,
    });
  }

  async notifyRequestAccepted(songTitle: string): Promise<boolean> {
    return this.sendNotification({
      title: 'Request Accepted',
      body: `Your request for "${songTitle}" has been accepted!`,
      sound: true,
    });
  }

  async notifyRequestDeclined(songTitle: string, reason?: string): Promise<boolean> {
    const body = reason 
      ? `Your request for "${songTitle}" was declined: ${reason}`
      : `Your request for "${songTitle}" was declined`;
    
    return this.sendNotification({
      title: 'Request Declined',
      body,
      sound: false,
    });
  }

  async notifySystemStatus(status: 'online' | 'offline' | 'maintenance'): Promise<boolean> {
    const messages = {
      online: {
        title: 'RequestBooth Online',
        body: 'Connection restored! You can now submit requests.',
      },
      offline: {
        title: 'RequestBooth Offline',
        body: 'Connection lost. Please check your internet connection.',
      },
      maintenance: {
        title: 'Maintenance Mode',
        body: 'RequestBooth is temporarily in maintenance mode.',
      },
    };

    return this.sendNotification({
      ...messages[status],
      sound: status === 'offline',
    });
  }

  async notifyUpdateAvailable(version: string): Promise<boolean> {
    return this.sendNotification({
      title: 'Update Available',
      body: `RequestBooth version ${version} is ready to install.`,
      sound: false,
    });
  }

  async notifyUpdateInstalled(version: string): Promise<boolean> {
    return this.sendNotification({
      title: 'Update Installed',
      body: `RequestBooth has been updated to version ${version}.`,
      sound: false,
    });
  }

  // Get current permission status
  get hasPermission(): boolean {
    return this.permissionGranted;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get isAvailable(): boolean {
    return this.isTauri();
  }
}

// Export a singleton instance
export const desktopNotifications = DesktopNotificationService.getInstance();