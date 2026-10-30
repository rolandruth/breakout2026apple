// Phone vibration for the mobile app. Does nothing in a normal web browser.
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const enabled = Capacitor.isNativePlatform();
let lastImpact = 0;

export function hapticImpact(style = 'light') {
  if (!enabled) return;
  const now = performance.now();
  if (now - lastImpact < 40) return; // avoid buzzing non-stop during fast brick chains
  lastImpact = now;
  const s = style === 'heavy' ? ImpactStyle.Heavy : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
  Haptics.impact({ style: s }).catch(() => {});
}

export function hapticNotify(type = 'success') {
  if (!enabled) return;
  const t = type === 'error' ? NotificationType.Error : type === 'warning' ? NotificationType.Warning : NotificationType.Success;
  Haptics.notification({ type: t }).catch(() => {});
}
