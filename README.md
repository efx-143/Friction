# 🛑 Friction
**A high-performance, stealth-mode anti-distraction app built with React Native.**

Friction is designed to break the doom-scrolling loop. It uses native Android capabilities to detect and block distracting applications, helping users regain focus effortlessly. 

## ✨ Key Features
* **Stealth Mode:** Password-protected access ensures the app cannot be bypassed easily.
* **Universal Compatibility:** Runs smoothly on both legacy (32-bit) and modern (64-bit) Android architectures.
* **Lightweight:** Fully optimized to run in the background without draining the battery.
* **Offline First:** Uses AsyncStorage for secure, completely offline local storage.

## 🛠️ Tech Stack
* **Framework:** React Native (v0.84)
* **Language:** JavaScript / TypeScript, Kotlin / Java (Native Android)
* **Engine:** Hermes (Custom compiled for Windows/WSL)
* **Storage:** AsyncStorage

## 🚀 Installation
Download the latest APK directly from the [Releases](#) section.
1. Download `app-release.apk`.
2. If prompted by Play Protect, select **"More details" -> "Install anyway"**.
3. Open the app and set up your master password.

## 💻 Build Locally
If you want to compile the app yourself:
```bash
git clone [https://github.com/efx-143/Friction.git](https://github.com/efx-143/Friction.git)
cd Friction
npm install
npx react-native run-android
