# AdMob Privacy Messaging Handover

This note records the privacy-messaging setup completed for the iOS production apps `StatStrike` and `GoalLab`.

## Apps covered

- StatStrike
  - Privacy: `https://jmclarenscripts.vercel.app/privacy/statstrike`
  - Terms: `https://jmclarenscripts.vercel.app/terms/statstrike`
  - Content rating: `https://jmclarenscripts.vercel.app/statstrike/content-rating`
  - AdMob app ID: `ca-app-pub-6299348707363839~3486565467`
  - Banner ad unit: `ca-app-pub-6299348707363839/1452051181`
  - Test banner ad unit: `ca-app-pub-3940256099942544/2435281174`
- GoalLab
  - Privacy: `https://jmclarenscripts.vercel.app/privacy/goallab`
  - Terms: `https://jmclarenscripts.vercel.app/terms/goallab`
  - Content rating: `https://jmclarenscripts.vercel.app/goallab/content-rating`
  - AdMob app ID: `ca-app-pub-6299348707363839~9063455739`
  - Banner ad unit #1: `ca-app-pub-6299348707363839/3877635718`
  - Banner ad unit #2: `ca-app-pub-6299348707363839/8178573889`
  - Interstitial ad unit: `ca-app-pub-6299348707363839/6159273336`
  - Test banner ad unit: `ca-app-pub-3940256099942544/2934735716`
  - Test interstitial ad unit: `ca-app-pub-3940256099942544/4411468910`

## Published message types

The following message types were published in AdMob:

- European regulations
- iOS App Tracking
- US states regulations

These message types now exist server-side. They only appear in the apps because the iOS projects were updated to use the UMP SDK and expose a `Manage privacy choices` entry point.

## Final settings chosen

### European regulations

- Automatically include common ad partners: on
- Automatically add ad sources as partners: on
- Check RTB creatives for consent: on
- Legitimate interest controls: on
- Enable by default: off
- Consent mode for advertising purposes: off
- Special feature 2: off
- Consent syncing: off
- Add purposes for your own use: none selected
- Do not consent: allow
- Close (do not consent): off
- Ad unit deployment: off
- Additional languages: enabled for all offered languages

### iOS App Tracking

Shared copy used for both apps:

- Title: `Help us show ads relevant to you`
- Body: `Tap "Allow" on the next screen so we can show ads that are more relevant to your interests. You can change this anytime in iOS Settings → Privacy & Security → Tracking.`

Reason for custom copy: the default “stay free for you” text was not accurate for StatStrike and came too close to Apple ATT anti-incentivising guidance.

### US states regulations

- Geography: `All current and future supported US States`
- Default consent content kept
- Entry point is handled in-app through the UMP privacy options form

## Important UI trap

The privacy policy URL field is easy to miss.

It is **not** in:

- the app settings screen
- the consent group modal
- the GDPR settings page

It lives here:

1. `Privacy & messaging`
2. Open the relevant message editor
3. `Setup`
4. `Your apps`
5. `Select apps`
6. Use the inline `Add URL` field in the `Privacy policy URL` column

Once entered there, the URL is cached against the app and reused by later messages.

## Known pitfalls

- The `Consent group` modal is for cross-app consent syncing, not for adding privacy policy URLs.
- Clicking `Create message` from inside `European regulations` creates another GDPR draft, not the ATT message.
- The ATT prompt requires both:
  - a published iOS App Tracking message in AdMob
  - `NSUserTrackingUsageDescription` in the app bundle
- Ad unit deployment is optional and was deliberately left off.
- The UMP Swift package product name is `GoogleUserMessagingPlatform`, while the Swift import module is `UserMessagingPlatform`.

## Project implementation summary

### StatStrike

- Added `StatStrikeConsentManager`
- Added `GoogleUserMessagingPlatform` package dependency
- Consent is gathered before calling `MobileAds.shared.start`
- Banner UI is only shown after consent is resolved and ads are allowed
- Added `Manage privacy choices` to `SettingsView`
- Added `NSUserTrackingUsageDescription` and current Google SKAdNetwork identifiers to `Info.plist`

### GoalLab

- Added `GoalLabConsentManager`
- Added `GoogleUserMessagingPlatform` package dependency
- Consent is gathered before calling `GoalLabAdManager.initializeAdMob()`
- Banner and interstitial paths are gated on consent state
- Added `Manage privacy choices` to `ConsumerSettingsView`
- Added `NSUserTrackingUsageDescription` and current Google SKAdNetwork identifiers to `GoalLab-Info.plist`

## Verification completed

- `StatStrike` simulator build passed after consent changes
- `StatStrikeConsumer` simulator build passed after consent changes

## If adding another app later

1. Create privacy policy and legal/support pages on the portfolio site.
2. Add the app to AdMob.
3. Create or assign:
   - European regulations message
   - iOS App Tracking message
   - US states regulations message
4. Add the app privacy URL through the message editor `Select apps` modal.
5. Keep ad unit deployment off unless there is a real per-unit consent need.
6. In the app code:
   - add `GoogleUserMessagingPlatform`
   - gather consent before starting ads
   - gate all banner/interstitial requests on consent state
   - add `Manage privacy choices` to Settings
   - add `NSUserTrackingUsageDescription`
   - add current Google SKAdNetwork identifiers

## Useful reference

- `POLICY_LINKS.md` already tracks the production privacy/support/legal URLs for apps on the portfolio site.
