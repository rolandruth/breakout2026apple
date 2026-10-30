# Breakout 2026: Android & iPhone app

This repository now builds three things from the same code:

- the website on Base44 (unchanged, `npm run build`),
- an **Android app** (`android/` folder),
- an **iPhone/iPad app** (`ios/` folder).

The apps are made with [Capacitor](https://capacitorjs.com). The whole game is **bundled inside the app**,
so it starts instantly and plays fully offline. Only the online leaderboard needs the internet.

## Base44 App ID

Your App ID (`6a16f13d0187184296952b85`) is already set in `.env.mobile`. To change it, edit that file.
The online leaderboard uses it to reach your Base44 backend.

## What changed in the game code

All changes also work on the website, so pushing them to Base44 is safe.

| File | Change |
|---|---|
| `src/api/base44Client.js`, `src/lib/AuthContext.jsx` | Backend address can be set for the app (website still uses its own address) |
| `src/main.jsx`, `src/index.css` | Fonts are bundled instead of loaded from Google, so they work offline |
| `src/lib/haptics.js`, `src/lib/soundEngine.js` | Phone vibration on paddle hits, destroyed bricks, power-ups, lost lives and level complete (apps only) |
| `vite.config.js` | Base44 editor helpers are switched off in the app build |
| `index.html` | `viewport-fit=cover` so the game uses the full screen around the notch |
| `capacitor.config.json`, `android/`, `ios/`, `assets/`, `.env.mobile` | New: the app projects, icon and splash screen |

## What you need

| | Android (Google Play) | iPhone / iPad (App Store) |
|---|---|---|
| Computer | Windows, Mac or Linux | **A Mac is required** |
| Software | [Android Studio](https://developer.android.com/studio) (latest), Node.js 22+ | Xcode (latest, from the Mac App Store), Node.js 22+ |
| Developer account | [Google Play Console](https://play.google.com/console), **$25 one time** | [Apple Developer Program](https://developer.apple.com/programs/), **$99 per year** |

New personal Google Play accounts must run a **closed test with at least 12 testers for 14 days**
before they can publish to everyone.

## Build and run

```bash
npm install
npm run cap:android   # builds the game, copies it into the app, opens Android Studio
npm run cap:ios       # same for Xcode (Mac only)
```

Every time you change the game, run `npm run cap:sync` (or one of the commands above) so the apps get the new version.
Unlike the website, **app users only get changes when you publish an app update** in the stores.

## Publishing to Google Play

1. `npm run cap:android`, then in Android Studio press Run to try it on a phone or emulator.
2. **Build > Generate Signed App Bundle / APK > Android App Bundle**. Create an upload key the first time.
   **Back up the `.jks` file and its passwords.**
3. In Play Console: create the app, fill in the store listing (screenshots, description, privacy policy URL,
   content rating, data safety form), upload the `.aab` under **Testing > Closed testing**, then **Production**.
4. For each update, raise `versionCode` (and `versionName`) in `android/app/build.gradle`.

If this repository is on GitHub, the workflow in `.github/workflows/android-build.yml` builds a test APK on every
push (download it from the Actions tab and install it on an Android phone).

## Publishing to the App Store (Mac)

**No Mac?** Use the cloud build: see [`store/IPHONE_BUILD_WITHOUT_MAC.md`](store/IPHONE_BUILD_WITHOUT_MAC.md) and `codemagic.yaml`.

The full App Store checklist, store text, privacy answers and screenshots are in [`store/APP_STORE.md`](store/APP_STORE.md).


1. `npm run cap:ios`. In Xcode, click the **App** target > **Signing & Capabilities**, tick
   "Automatically manage signing" and choose your team.
2. Run it on a simulator or your iPhone.
3. **Product > Archive**, then **Distribute App > App Store Connect > Upload**.
4. In [App Store Connect](https://appstoreconnect.apple.com): create the app, add screenshots (6.9" iPhone and
   13" iPad), description, privacy policy URL, age rating and privacy details, choose the build and submit.
   Use TestFlight to test first.
5. For each update, raise the Version and Build numbers in Xcode (App target > General).

## Apple review tips

Apple rejects apps that are only a website (guideline 4.2). This app bundles the full game, plays offline and uses
vibration, which is what Apple looks for. Also:

- Mention "offline play and haptic feedback" in the review notes.
- The Settings screen has a **Delete Account** button. If players can't create accounts in the app, consider hiding
  it in the app build to avoid reviewer questions; if accounts exist, keep it (Apple requires account deletion).
- Both stores need a **privacy policy URL**. The leaderboard stores the player name and score, so mention that.

## Names and icons

- App name **Breakout 2026**, app ID **com.breakout2026.game**. Change them in `capacitor.config.json` before the
  first upload (the ID can never change afterwards), then delete `android/` and `ios/` and run
  `npx cap add android && npx cap add ios` again, or change the ID in Android Studio / Xcode.
- The icon and splash screen in `assets/` are placeholders matching the game's colours. Replace
  `assets/icon-only.png` (1024×1024), `icon-foreground.png`, `icon-background.png`, `splash.png` and
  `splash-dark.png` (2732×2732) with your own artwork, then run `npm run cap:assets`.
- The app is locked to portrait.
