# Cara Reset Onboarding Screen

Onboarding screen hanya muncul **sekali** saat pertama kali buka aplikasi. Setelah itu, status disimpan di AsyncStorage dan tidak akan muncul lagi.

## Cara Reset Onboarding (untuk Testing)

### Opsi 1: Reset via Code (Recommended untuk Development)

Edit file `MobileVersion/App.js`, cari function `checkOnboarding()` dan uncomment baris ini:

```javascript
// RESET ONBOARDING: Uncomment baris di bawah untuk reset onboarding (untuk testing)
await AsyncStorage.removeItem('hasSeenOnboarding');
```

Jadi menjadi:
```javascript
const checkOnboarding = async () => {
  try {
    // RESET ONBOARDING: Uncomment baris di bawah untuk reset onboarding (untuk testing)
    await AsyncStorage.removeItem('hasSeenOnboarding'); // <-- UNCOMMENT INI
    
    const seenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
    // ...
  }
}
```

Setelah itu, restart aplikasi. Onboarding akan muncul lagi.

**Jangan lupa comment lagi setelah testing!**

### Opsi 2: Reset via Expo Dev Tools

1. Buka aplikasi di Expo Go
2. Shake device atau tekan `Cmd+D` (iOS) / `Cmd+M` (Android)
3. Pilih "Debug Remote JS"
4. Di browser console, jalankan:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('hasSeenOnboarding').then(() => {
  console.log('Onboarding reset!');
  // Reload app
});
```

### Opsi 3: Uninstall & Reinstall App

- Uninstall aplikasi dari device
- Install ulang
- Onboarding akan muncul lagi

### Opsi 4: Clear App Data (Android)

1. Settings → Apps → My BEM
2. Storage → Clear Data
3. Buka aplikasi lagi

### Opsi 5: Reset via Terminal (Development)

Jika menggunakan Expo CLI, bisa tambahkan script di `package.json`:

```json
{
  "scripts": {
    "reset:onboarding": "npx expo start --clear"
  }
}
```

Lalu jalankan:
```bash
npm run reset:onboarding
```

## Cara Kerja Onboarding

1. **First Open**: 
   - `hasSeenOnboarding` = `null` atau tidak ada
   - Onboarding muncul
   - Setelah selesai, simpan `hasSeenOnboarding = 'true'`

2. **Next Opens**:
   - `hasSeenOnboarding` = `'true'`
   - Langsung ke Login/Dashboard
   - Onboarding tidak muncul

## File yang Terlibat

- `App.js` - Check status onboarding
- `src/screens/OnboardingScreen.js` - Screen onboarding
- `AsyncStorage` - Menyimpan status `hasSeenOnboarding`

## Catatan

- Status onboarding disimpan **persisten** di device
- Reset hanya untuk **development/testing**
- Di production, user hanya lihat onboarding **sekali**

---

**Tips**: Untuk development, lebih baik uncomment reset code di `App.js` agar setiap restart app, onboarding selalu muncul.

