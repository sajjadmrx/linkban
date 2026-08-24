# Linkban (لینکبان)

<p align="center">
  <img src="./public/banner.jpg" alt="Linkban Banner" width="100%" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" />
</p>

<p align="center">
  <strong>The quiet, distraction-free link assistant for Android.</strong><br>
  Save web links in one second, set gentle reminders to revisit them later, or keep them safe in a private vault.
</p>

<p align="center">
  <a href="#how-linkban-helps-you">How It Helps You</a> •
  <a href="#everyday-features">Everyday Features</a> •
  <a href="#privacy-first">Privacy & Offline</a> •
  <a href="#support--connect">Support</a> •
  <a href="#for-developers">Technical Info</a>
</p>

---

## How Linkban Helps You

Do you constantly have 50+ open tabs in your mobile browser "to read later"? Or copy links into saved messages and forget about them?

**Linkban** brings calm to your reading list:

1. **Stop tab hoarding**: Free your browser and battery by parking interesting articles, recipes, tools, and videos in Linkban.
2. **Read at the right moment**: Set a reminder for when you actually have free time — whether that's in 2 hours, tonight, or this weekend.
3. **Keep private links private**: Move sensitive discoveries or gift ideas to a secret vault locked with your fingerprint or PIN.
4. **Zero clutter, zero pressure**: Clean list grouped by what is due now and what can wait. Mark links as read with one tap.

---

## Everyday Features

### ⚡ Save in One Tap, Without Opening the App
- **Share to Linkban**: Tap "Share" from Chrome, Firefox, Telegram, YouTube, or any app, and choose Linkban.
- **Select Text & Save**: Highlight any URL on your screen and select **"Save to Linkban"** in the text menu. The link saves silently in the background so you never lose your reading flow.
- **Instant Clipboard Paste**: Copied a link? Opening Linkban automatically offers to save it for you.

### ⏰ Gentle Reminders or Simple Bookmarks
- **Customizable Intervals**: Choose 30 minutes, 1 hour, 2 hours, 1 day, or set a custom time.
- **Save-Only Mode**: Don't want reminders? Save links simply as clean bookmarks.
- **Quiet Hours**: Define your sleeping hours so Linkban never rings or vibrates when you're resting.
- **One-Tap Snooze**: Busy when a reminder arrives? Snooze it right from the notification with a single tap.

### 🔒 Secret Vault & Biometric Lock
- **Fingerprint & PIN Protected**: Keep sensitive links away from curious eyes.
- **Hidden Notification Content**: When a secret link is due, the notification hides the website title and URL for your privacy.
- **Biometric Unlock on Tap**: Tapping a secret reminder prompts your fingerprint before opening the page.

### 📊 Reading History & Insights
- **Visit Tracking**: See how many times you've visited your favorite articles and sites.
- **Completed Archive**: Done with an article? Check it off and keep an organized archive you can revisit anytime.
- **Visual Overview**: Simple, clean charts of your top visited websites and reading habits.

### 🌐 Dual Language Experience
- **English & Persian (فارسی)**: Full, conversational bilingual experience with natural text direction and typography.
- **Quick 3-Step Setup**: Friendly initial onboarding to pick your language and tour key features.

---

## Privacy First — 100% Offline

Linkban is designed around your privacy and data ownership:

- **No account needed**: Never sign up, enter an email, or remember a password.
- **100% Offline**: All your links, notes, and history remain strictly on your phone.
- **Zero tracking or ads**: No analytics, no third-party telemetry, no battery drain.
- **Easy backup**: Export all your data to a backup file anytime with one tap and restore it on another device.

---

## Support & Connect

Linkban is crafted with care by **Sajjad**.

- ☕ **Buy me a coffee**: [coffeete.ir/sajjadmrx](https://coffeete.ir/sajjadmrx)
- 𝕏 **Twitter / X**: [@sajjadmrx](https://x.com/sajjadmrx)

---

## For Developers

For developers interested in the technical stack or building the project from source:

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI 5
- **Mobile Container**: Capacitor 8 (Android)
- **Native Android Features**: Background `ProcessText` activity for system text selection, native alarm scheduling, local notifications, and Android BiometricPrompt.

### Build Instructions

```bash
# 1. Install dependencies using Bun
bun install

# 2. Run local development server
bun run dev

# 3. Build web production bundle
bun run build

# 4. Sync web assets with Capacitor Android
bunx cap sync android

# 5. Open project in Android Studio or compile APK
bunx cap open android
# or
cd android && ./gradlew assembleDebug
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
