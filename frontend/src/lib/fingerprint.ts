'use client';

/**
 * Generates a stable browser fingerprint for visitor tracking.
 * Combines canvas, WebGL, screen, and browser info into a hash.
 * Not perfect identification — just a stable anonymous ID per browser.
 */
export function getVisitorFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const stored = sessionStorage.getItem('vfp');
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '',
    (navigator as any).deviceMemory?.toString() || '',
  ].join('|');

  // Simple djb2 hash
  let hash = 5381;
  for (let i = 0; i < components.length; i++) {
    hash = ((hash << 5) + hash) ^ components.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit int
  }
  const fingerprint = 'fp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);

  sessionStorage.setItem('vfp', fingerprint);
  return fingerprint;
}

export function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

export function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
}

export function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}
