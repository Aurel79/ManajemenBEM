# BEM TEL-U Mobile App

React Native Expo mobile application untuk BEM TEL-U Management System.

## Fitur

- ✅ Login dengan JWT authentication
- ✅ Welcome screen dengan user info
- ✅ Logout functionality
- ✅ Token persistence dengan AsyncStorage
- ✅ Protected routes
- ✅ API integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi API Base URL

Edit file `src/config/api.js` untuk mengatur base URL API:

```javascript
const API_BASE_URL = 'http://YOUR_IP:8000/api/v1'; // Ganti dengan IP server
```

**Catatan:** Jika testing di emulator Android, gunakan `10.0.2.2` sebagai IP.
Jika testing di device fisik atau iOS, gunakan IP computer Anda.

### 3. Start Laravel Backend

Pastikan Laravel backend sudah berjalan di port 8000:

```bash
php artisan serve
```

### 4. Jalankan Mobile App

```bash
# Untuk Android
npm run android

# Untuk iOS
npm run ios

# Atau buka di Expo Go app
npm start

# Untuk akses dari luar jaringan (tunnel mode)
npm run start:tunnel

# Untuk akses dalam jaringan yang sama (LAN mode)
npm run start:lan
```

**Catatan Tunnel Mode:**
- Tunnel mode membuat URL yang bisa diakses dari mana saja
- Bagikan URL/QR code yang muncul ke teman
- Jika error adb muncul, script akan mengabaikannya dan tunnel tetap berjalan
- Tunggu beberapa detik untuk tunnel URL muncul di terminal

**Alternatif jika tunnel mode bermasalah:**
1. Install Android SDK tools: `sudo apt-get install android-tools-adb`
2. Atau gunakan ngrok manual:
   - Install ngrok dari https://ngrok.com
   - Jalankan: `ngrok http 8081` (di terminal terpisah)
   - Jalankan: `npm start` (Expo normal)
   - Bagikan URL ngrok ke teman

## Testing

Gunakan kredensial berikut untuk testing:
- **Email:** admin@mail.com
- **Password:** password

## Struktur Project

```
MobileVersion/
├── src/
│   ├── config/
│   │   └── api.js              # API configuration
│   ├── screens/
│   │   ├── LoginScreen.js      # Login screen
│   │   └── WelcomeScreen.js    # Welcome screen
│   └── services/
│       └── authService.js      # Authentication service
├── App.js                       # Main app with navigation
├── package.json
└── README.md
```

## API Endpoints

- `POST /api/v1/login` - Login user
- `POST /api/v1/logout` - Logout user
- `GET /api/v1/me` - Get current user info
- `POST /api/v1/refresh` - Refresh JWT token

## Tech Stack

- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage
- JWT Authentication

## License

BEM TEL-U © 2025

