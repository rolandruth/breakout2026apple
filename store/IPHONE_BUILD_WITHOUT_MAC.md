# Build and upload the iPhone app without a Mac

Codemagic builds the app on a Mac in the cloud, signs it and uploads it to App Store Connect.
The free plan includes 500 Mac build minutes a month. One build takes about 15 to 25 minutes.
All settings are already in `codemagic.yaml`. You only click.

You need: your Apple Developer account, a free GitHub account with this project on it,
and the file `ios_distribution_private_key.txt` (your signing key, keep it safe and private).

## 1. Create an App Store Connect API key (5 min)

1. Open https://appstoreconnect.apple.com > **Users and Access** > tab **Integrations** > **App Store Connect API**.
2. First time only: click **Request Access**, accept, and reload the page.
3. Under **Team Keys** click **+** (or **Generate API Key**).
4. Name: `Codemagic`. Access: **App Manager**. Click **Generate**.
5. Click **Download** next to the new key. You get a file like `AuthKey_ABC123XYZ.p8`.
   **Apple lets you download it only once.** Keep it.
6. On the same page, copy the **Issuer ID** (above the table) and the **Key ID** (in the row of your key)
   into Notepad.

## 2. Connect Codemagic (5 min)

1. Open https://codemagic.io/signup and click **Sign up with GitHub**. Allow access to the `breakout2026apple` repository.
2. Click **Add application** > **GitHub** > choose `breakout2026apple` > type **Ionic Capacitor App** (or "Other") > **Finish**.
   Codemagic finds `codemagic.yaml` by itself.
3. Add the API key: click **Teams** (left menu) > your team > **Team integrations** > **Developer Portal** > **Connect** / **Manage keys** > **Add key**:
   - **App Store Connect API key name**: `Breakout ASC key` (type it exactly like this)
   - **Issuer ID** and **Key ID**: paste from Notepad
   - **API key**: upload the `.p8` file
   - Click **Save**.
4. Add the signing key: open your app in Codemagic > tab **Environment variables**:
   - **Variable name**: `CERTIFICATE_PRIVATE_KEY`
   - **Variable value**: open `ios_distribution_private_key.txt` in Notepad, press Ctrl+A, Ctrl+C, and paste
     everything (including the BEGIN and END lines)
   - **Variable group**: type `ios_signing` and press Enter
   - Tick **Secure**, click **Add**.

## 3. Run the build

1. In Codemagic open the app > **Start new build**.
2. Branch: `main`. Workflow: **iPhone app > App Store Connect**. Click **Start new build**.
3. Wait until it is green (15 to 25 min). The first build creates your signing certificate at Apple automatically.

## 4. Pick the build in App Store Connect

1. Apple processes the upload for 10 to 30 minutes and then emails you.
2. App Store Connect > **Apps** > Breakout 2026 > version **1.0** > section **Build** > **Add Build** > select it > **Done** > **Save**.
3. Optional: test it first on your iPhone with the **TestFlight** app (App Store Connect > TestFlight tab).
4. Press **Add for Review** / **Submit for Review**.

## Next updates

Change the game, push to GitHub, and press **Start new build** again. The build number goes up by itself.
For a new version number (1.1, 1.2 ...) change `APP_VERSION` in `codemagic.yaml`.

## If the build turns red

Click the red step, copy the last 30 lines and send them to Claude.
Common causes: the API key name in Codemagic is not exactly `Breakout ASC key`; the variable group is not
exactly `ios_signing`; the API key has less than App Manager access; you already have 3 distribution
certificates at Apple (delete an old one under developer.apple.com > Certificates).
