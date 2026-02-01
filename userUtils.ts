// User identification and device fingerprinting utilities

export function generateUserUUID(): string {
  // Check if user already has a UUID stored
  let userUuid = localStorage.getItem('userUuid');
  
  if (!userUuid) {
    // Generate a new UUID
    userUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    localStorage.setItem('userUuid', userUuid);
  }
  
  return userUuid;
}

export function generateDeviceFingerprint(): string {
  // Simple device fingerprinting based on available browser properties
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Create a simple hash of the fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

export function getUserIdentification() {
  return {
    userUuid: generateUserUUID(),
    deviceFingerprint: generateDeviceFingerprint()
  };
}