# Panduan Build Aplikasi My BEM

Panduan lengkap untuk build aplikasi My BEM menjadi APK (Android) atau IPA (iOS).

## Prerequisites

1. **Install EAS CLI** (jika belum):
```bash
npm install -g eas-cli
```

2. **Login ke Expo Account**:
```bash
eas login
```

Jika belum punya account, buat di: https://expo.dev/signup

## Opsi 1: Build dengan EAS Build (Cloud Build) - Recommended

EAS Build akan build aplikasi di cloud Expo, jadi tidak perlu setup Android Studio atau Xcode.

### Build Android APK

#### Build untuk Testing (Preview):
```bash
npm run build:android
```

Atau langsung:
```bash
eas build --platform android --profile preview
```

#### Build untuk Production:
```bash
npm run build:android:prod
```

Atau langsung:
```bash
eas build --platform android --profile production
```

### Build iOS IPA

#### Build untuk Testing (Preview):
```bash
npm run build:ios
```

#### Build untuk Production:
```bash
npm run build:ios:prod
```

### Build Keduanya (Android + iOS):
```bash
npm run build:all
```

## Opsi 2: Local Build (Perlu Android Studio / Xcode)

### Android (APK)

1. **Install Android Studio** dan setup Android SDK
2. **Jalankan prebuild**:
```bash
npx expo prebuild
```

3. **Build APK**:
```bash
npm run android
```

Atau build APK langsung:
```bash
cd android
./gradlew assembleRelease
```

APK akan ada di: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (IPA)

1. **Install Xcode** (hanya di macOS)
2. **Jalankan prebuild**:
```bash
npx expo prebuild
```

3. **Buka di Xcode**:
```bash
cd ios
open MobileVersion.xcworkspace
```

4. **Build di Xcode**: Product > Archive

## Setelah Build

### Download APK/IPA

Setelah build selesai (EAS Build):
1. Cek status build: `eas build:list`
2. Download dari link yang diberikan
3. Atau akses di: https://expo.dev/accounts/[your-account]/builds

### Install APK ke Android

1. **Via ADB** (jika device terhubung):
```bash
adb install path/to/app.apk
```

2. **Via File Manager**:
   - Transfer APK ke HP
   - Buka file manager
   - Tap APK dan install
   - Izinkan "Install from Unknown Sources" jika diminta

### Install IPA ke iOS

1. **Via TestFlight** (recommended untuk testing)
2. **Via Xcode** (untuk development)
3. **Via App Store** (untuk production)

## Troubleshooting

### Error: "EAS CLI not found"
```bash
npm install -g eas-cli
```

### Error: "Not logged in"
```bash
eas login
```

### Error: "Project ID not found"
Pastikan `app.json` sudah memiliki `extra.eas.projectId` (sudah ada).

### Build terlalu lama
- EAS Build biasanya memakan waktu 10-30 menit
- Pastikan koneksi internet stabil
- Cek status di: https://expo.dev/accounts/[your-account]/builds

### APK terlalu besar
- Gunakan `buildType: "apk"` untuk APK yang lebih kecil
- Atau gunakan AAB untuk upload ke Play Store (lebih kecil)

## Tips

1. **Testing sebelum build production**:
   - Selalu test dengan preview build dulu
   - Pastikan semua fitur berfungsi

2. **Version Management**:
   - Version otomatis increment di production build
   - Atau manual edit di `app.json`

3. **Keystore (Android)**:
   - EAS akan generate keystore otomatis
   - Simpan credentials dengan aman

4. **Signing (iOS)**:
   - Perlu Apple Developer account ($99/tahun)
   - EAS akan handle signing otomatis

## Script Build yang Tersedia

- `npm run build:android` - Build Android APK (preview)
- `npm run build:android:prod` - Build Android APK (production)
- `npm run build:ios` - Build iOS IPA (preview)
- `npm run build:ios:prod` - Build iOS IPA (production)
- `npm run build:all` - Build Android + iOS (preview)

## Next Steps

Setelah build berhasil:
1. Test APK/IPA di device
2. Fix bugs jika ada
3. Build production untuk release
4. Upload ke Play Store / App Store

---

**Happy Building! 🚀**

