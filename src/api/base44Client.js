import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  // Empty = same origin (Base44 hosting). The mobile app sets VITE_BASE44_SERVER_URL in .env.mobile.
  serverUrl: import.meta.env.VITE_BASE44_SERVER_URL || '',
  requiresAuth: false,
  appBaseUrl,
  // The mobile app turns Base44 usage analytics off (VITE_BASE44_ANALYTICS=false in .env.mobile),
  // so the App Store privacy label can say "Data Not Collected".
  analytics: { enabled: import.meta.env.VITE_BASE44_ANALYTICS !== 'false' }
});
