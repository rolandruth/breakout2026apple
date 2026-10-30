import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `npm run build:mobile` builds the Android/iOS app. Base44 editor helpers
  // only work on Base44 hosting, so they are switched off there.
  const isMobile = mode === 'mobile';
  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: !isMobile,
        navigationNotifier: !isMobile,
        analyticsTracker: !isMobile,
        visualEditAgent: !isMobile
      }),
      react(),
    ]
  };
});
