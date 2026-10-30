# Breakout 2026: App Store checklist

## Already done in the project

| Requirement | Status |
|---|---|
| App icon 1024×1024, no transparency | ✅ `ios/App/App/Assets.xcassets/AppIcon.appiconset` (placeholder art, replace if you like) |
| Launch (splash) screen | ✅ `LaunchScreen.storyboard` + splash images |
| Bundle ID | ✅ `com.breakout2026.game` (register exactly this in your Apple account) |
| Version / build number | ✅ Version 1.0, Build 1. Raise Build for every upload, Version for every release |
| Privacy manifest (required since 2024) | ✅ `ios/App/App/PrivacyInfo.xcprivacy`: no tracking, no data collected |
| Export compliance | ✅ `ITSAppUsesNonExemptEncryption = NO` in Info.plist, so no encryption questions at upload |
| Device support | ✅ iPhone only, portrait. iPads run it in iPhone mode, so **no iPad screenshots are needed** |
| Minimum iOS | iOS 15 |
| Works offline, haptics, native feel (guideline 4.2) | ✅ Game is bundled in the app, vibration on hits |
| No broken buttons | ✅ "Delete Account" now hidden (players never sign in, so it did nothing) |
| No keyboard/mouse hints | ✅ App shows "Slide to move • Tap to launch" |
| No data collection | ✅ Base44 usage analytics switched off in the app build |
| Screenshots | ✅ `store/screenshots-iphone-6.9/`: 10 ready to upload in order (Apple allows max 10), 6 spares in `extra/`. All 1320×2868, the 6.9" size Apple requires |
| Privacy policy page | ✅ `public/privacy.html` (contact: support@homefilterapp.tech) |
| Support page | ✅ `public/support.html` (contact: support@homefilterapp.tech) |

## What only you can do

1. **Put the two pages online.** Push this code to your Base44 project and publish. The pages will then be at
   `https://friendly-neon-brick-blast.base44.app/privacy.html` and `.../support.html`. Open both links in a browser
   to check they load. Any other public web page (Google Sites, GitHub Pages) works too.
2. **Apple Developer Program**: enrol at https://developer.apple.com/programs/ ($99/year). Individual enrolment takes
   about a day. As an organisation you need a D-U-N-S number first. Since 2025 the EU also requires you to declare
   whether you are a "trader" (DSA); as a trader your address and contact details are shown on the store page.
3. **A Mac with the latest Xcode.** Apple only accepts builds made with the current Xcode / iOS SDK.
4. **Signing**: in Xcode, select the **App** target > Signing & Capabilities > tick "Automatically manage signing"
   and choose your team. Xcode creates the certificate and registers the bundle ID.
5. **Create the app in App Store Connect** (https://appstoreconnect.apple.com > Apps > +): platform iOS, name
   "Breakout 2026", bundle ID `com.breakout2026.game`, SKU e.g. `breakout2026`. If the name is taken, try
   "Breakout 2026: Neon Bricks".
6. **Build and upload**: `npm run cap:ios` > in Xcode choose "Any iOS Device (arm64)" > Product > Archive >
   Distribute App > App Store Connect > Upload.
7. **Test it with TestFlight** on a real iPhone (strongly recommended).
8. **Fill in the store page** with the text below, upload the screenshots, answer App Privacy and Age Rating,
   choose the build and press **Submit for Review**. Review usually takes 1 to 3 days.

## Store listing text (copy and paste)

**Name** (max 30): `Breakout 2026`

**Subtitle** (max 30): `Neon brick breaker arcade`

**Category**: Games > Arcade (secondary: Games > Action)

**Price**: Free (App Store Connect > Pricing and Availability > Price: **USD 0.00 (Free)**, all countries). No in-app purchases: leave the In-App Purchases section empty.

**Promotional text** (max 170):
```
Smash glowing neon bricks, chain massive combos and take on the boss. Classic arcade action rebuilt for 2026. Plays offline, no ads, no sign-up.
```

**Description** (max 4000):
```
Breakout 2026 brings the classic brick breaker into a neon future.

Slide to move your paddle, launch the ball and smash every brick on screen. Chain hits together to build combos and multiply your score, grab power-ups as they fall, and fight your way up to the boss.

FEATURES
• Fast, smooth arcade gameplay made for touch
• Combo multiplier: the longer your chain, the bigger the points
• Power-ups to catch and use
• Boss battles to test your skills
• Four difficulty levels: Easy, Normal, Hard and Insane
• Unlock ball and paddle skins as you score points and reach new levels
• Achievements and personal high scores for every difficulty
• Electronic music and punchy sound effects
• Haptic feedback: feel every hit
• Plays fully offline
• No ads, no account, no data collection

How far can you go?
```

**Keywords** (max 100, comma separated, no spaces needed):
```
brick,breaker,arkanoid,arcade,retro,neon,paddle,ball,bricks,classic,blocks,offline,smash,combo
```

**Support URL**: `https://friendly-neon-brick-blast.base44.app/support.html`

**Privacy Policy URL**: `https://friendly-neon-brick-blast.base44.app/privacy.html`

**Marketing URL** (optional): `https://friendly-neon-brick-blast.base44.app/`

**Copyright**: `2026 <your name or company>`

## App Privacy (App Store Connect > App Privacy)

- "Do you or your third-party partners collect data from this app?" → **No, we do not collect data from this app.**
- The label will show **Data Not Collected**. This matches the privacy manifest and the privacy policy.

## Age Rating questionnaire

Answer **None / No** to everything (violence, mature themes, gambling, contests, user-generated content,
messaging, web browsing, in-app purchases, advertising, parental controls). Expected result: **4+**.

## App Review notes (App Store Connect > App Review Information)

- Sign-in required: **No** (leave the demo account empty)
- Notes:
```
Breakout 2026 is an arcade brick-breaker game. The full game is bundled in the app and works completely offline. It uses native haptic feedback on hits, power-ups and level completion. No account, no ads, no in-app purchases, no data collection. Controls: slide a finger to move the paddle, tap to launch the ball.
```
- Contact information: your name, phone number and email (only Apple sees these).

## Common reasons for rejection, and how this app handles them

| Guideline | Risk | Handled by |
|---|---|---|
| 4.2 Minimum functionality (web wrapper) | High for website-only apps | Game bundled locally, offline play, haptics |
| 2.1 App completeness (crashes, broken buttons) | Medium | Delete Account hidden; test everything in TestFlight first |
| 5.1.1 Privacy policy | Required | `public/privacy.html` |
| 2.3 Accurate metadata | Screenshots must show the real app | Screenshots are taken from the app itself |
| 4.0 Design | Medium | Native feel, portrait lock, safe-area support |
