import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  restricted?: boolean;
}

export interface PermissionResult {
  camera: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
}

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<PermissionStatus> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      
      const cameraStatus = permissions.camera;
      const photosStatus = permissions.photos;
      
      return {
        granted: cameraStatus === 'granted' && photosStatus === 'granted',
        denied: cameraStatus === 'denied' || photosStatus === 'denied',
        prompt: cameraStatus === 'prompt' || photosStatus === 'prompt'
      };
    } else {
      // Web platform - check MediaDevices API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return { granted: true, denied: false, prompt: false };
      } catch (error) {
        return { granted: false, denied: true, prompt: false };
      }
    }
  } catch (error) {
    console.error('Camera permission request failed:', error);
    return { granted: false, denied: true, prompt: false };
  }
};

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<PermissionStatus> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Geolocation.requestPermissions({
        permissions: ['location']
      });
      
      const locationStatus = permissions.location;
      
      return {
        granted: locationStatus === 'granted',
        denied: locationStatus === 'denied',
        prompt: locationStatus === 'prompt'
      };
    } else {
      // Web platform - check Geolocation API
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });
        return { granted: true, denied: false, prompt: false };
      } catch (error) {
        return { granted: false, denied: true, prompt: false };
      }
    }
  } catch (error) {
    console.error('Location permission request failed:', error);
    return { granted: false, denied: true, prompt: false };
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<PermissionStatus> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Request both local and push notification permissions
      const [localPerms, pushPerms] = await Promise.all([
        LocalNotifications.requestPermissions(),
        PushNotifications.requestPermissions()
      ]);
      
      const localStatus = localPerms.display;
      const pushStatus = pushPerms.receive;
      
      return {
        granted: localStatus === 'granted' && pushStatus === 'granted',
        denied: localStatus === 'denied' || pushStatus === 'denied',
        prompt: localStatus === 'prompt' || pushStatus === 'prompt'
      };
    } else {
      // Web platform - check Notification API
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return {
          granted: permission === 'granted',
          denied: permission === 'denied',
          prompt: permission === 'default'
        };
      } else {
        return { granted: false, denied: true, prompt: false };
      }
    }
  } catch (error) {
    console.error('Notification permission request failed:', error);
    return { granted: false, denied: true, prompt: false };
  }
};

/**
 * Check current permission status without requesting
 */
export const checkPermissions = async (): Promise<PermissionResult> => {
  try {
    const [cameraPerms, locationPerms, notificationPerms] = await Promise.all([
      Camera.checkPermissions(),
      Geolocation.checkPermissions(),
      LocalNotifications.checkPermissions()
    ]);

    return {
      camera: {
        granted: cameraPerms.camera === 'granted' && cameraPerms.photos === 'granted',
        denied: cameraPerms.camera === 'denied' || cameraPerms.photos === 'denied',
        prompt: cameraPerms.camera === 'prompt' || cameraPerms.photos === 'prompt'
      },
      location: {
        granted: locationPerms.location === 'granted',
        denied: locationPerms.location === 'denied',
        prompt: locationPerms.location === 'prompt'
      },
      notifications: {
        granted: notificationPerms.display === 'granted',
        denied: notificationPerms.display === 'denied',
        prompt: notificationPerms.display === 'prompt'
      }
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      camera: { granted: false, denied: true, prompt: false },
      location: { granted: false, denied: true, prompt: false },
      notifications: { granted: false, denied: true, prompt: false }
    };
  }
};

/**
 * Request all permissions at once
 */
export const requestAllPermissions = async (): Promise<PermissionResult> => {
  const [camera, location, notifications] = await Promise.all([
    requestCameraPermissions(),
    requestLocationPermissions(),
    requestNotificationPermissions()
  ]);

  return { camera, location, notifications };
};

/**
 * Show permission denied alert with instructions
 */
export const showPermissionDeniedAlert = (permissionType: string) => {
  const instructions = Capacitor.getPlatform() === 'ios' 
    ? 'Go to Settings > CaseFlow Mobile > Permissions'
    : 'Go to Settings > Apps > CaseFlow Mobile > Permissions';
    
  alert(
    `${permissionType} Permission Required\n\n` +
    `This app needs ${permissionType.toLowerCase()} access to function properly.\n\n` +
    `To enable: ${instructions}`
  );
};
