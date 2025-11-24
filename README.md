# BEM TEL-U Management System

Sistem Manajemen Badan Eksekutif Mahasiswa Telkom University dengan versi Web dan Mobile.

## 🚀 Quick Start

**Baca [BUILD_APK.md](BUILD_APK.md) untuk cara build APK Android!**

## 📁 Struktur Project

```
Laravel-SytemManagementORG/
├── WebVersion/         # Laravel Web Application (Filament Admin Panel)
├── MobileVersion/      # React Native Expo Mobile App
└── README.md           # Dokumentasi utama
```

## 🌐 WebVersion (Laravel + Filament)

Aplikasi web admin berbasis Laravel 11 dengan Filament Admin Panel.

### Fitur
- ✅ User Management dengan Role & Permission
- ✅ Ministry Management (Kementerian)
- ✅ Proposal Management dengan workflow approval
- ✅ Program Kerja Management
- ✅ Activity Log (khusus Super Admin)
- ✅ Dashboard dengan charts dan statistik
- ✅ JWT Authentication API
- ✅ Landing page dengan tema black & red tech

### Tech Stack
- Laravel 11
- Filament PHP
- Spatie Laravel Permission
- JWT Auth (tymon/jwt-auth)
- SQLite Database
- Tailwind CSS

### Setup
```bash
cd WebVersion
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve
npm run dev
```

Akses: http://localhost:8000/admin

### Default Users
- **Email:** admin@mail.com | **Password:** password (Super Admin)
- **Email:** presiden@mail.com | **Password:** password
- **Email:** sekretaris@mail.com | **Password:** password
- **Email:** menteri@mail.com | **Password:** password

## 📱 MobileVersion (React Native Expo)

Aplikasi mobile React Native menggunakan Expo.

### Fitur
- ✅ Login dengan JWT authentication
- ✅ Welcome screen dengan user info
- ✅ Logout functionality
- ✅ Token persistence
- ✅ Protected routes
- ✅ Modern UI dengan tema BEM TEL-U
- ✅ Role-based dashboard (Admin, Presiden, Menteri, Anggota)
- ✅ Onboarding screen

### Tech Stack
- React Native 0.81
- Expo
- React Navigation
- Axios
- AsyncStorage
- JWT Authentication

### Setup
```bash
cd MobileVersion
npm install
# Edit src/config/api.js untuk set API base URL
npm start
# Atau npm run android
```

Lihat [MobileVersion/README.md](MobileVersion/README.md) untuk dokumentasi lengkap.

## 🔐 API Documentation

### Endpoints
- `POST /api/v1/login` - Login user
- `POST /api/v1/logout` - Logout user  
- `GET /api/v1/me` - Get current user
- `POST /api/v1/refresh` - Refresh JWT token

### Testing API
```bash
cd WebVersion
php artisan serve
# API tersedia di http://localhost:8000/api/v1/login
```

Lihat [WebVersion/API_README.md](WebVersion/API_README.md) untuk dokumentasi lengkap API.

## 🏗️ Arsitektur

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │ HTTP/REST
         │ JWT Token
         ▼
┌─────────────────┐
│  Laravel API    │
│  (JWT Auth)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
└─────────────────┘

┌─────────────────┐
│   Web Admin     │
│   (Filament)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
└─────────────────┘
```

## 📋 Role & Permissions

### Super Admin
- Akses penuh ke semua fitur
- Manage Activity Log
- Manage Roles & Permissions

### Presiden BEM
- View, Create, Update, Delete semua proposal
- Manage Users dan Ministries
- Tidak bisa akses Activity Log dan Roles

### Sekretaris / Bendahara
- View, Create, Update, Delete semua proposal
- Manage Program Kerja
- Tidak bisa delete user

### Menteri
- Manage proposal dan program kerja untuk ministry mereka
- View semua proposal

### Anggota
- Create dan view proposal
- Create dan view program kerja

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone [repository-url]
cd Laravel-SytemManagementORG
```

### 2. Setup Web Version
```bash
cd WebVersion
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve
```

### 3. Setup Mobile Version
```bash
cd MobileVersion
npm install
# Edit src/config/api.js: set API_BASE_URL ke http://YOUR_IP:8000/api/v1
npm start
```

### 4. Testing
- **Web:** http://localhost:8000/admin
- **API:** http://localhost:8000/api/v1/login
- **Mobile:** Scan QR code dengan Expo Go app

## 📝 Notes

- Web dan Mobile menggunakan database yang sama (SQLite)
- JWT token berlaku 60 menit
- Activity Log hanya bisa diakses oleh Super Admin
- File upload disimpan di `storage/app/public/proposals/`

## 📄 License

BEM TEL-U © 2025

## 👥 Contributors

Badan Eksekutif Mahasiswa Telkom University

---

**Happy Coding! 🚀**

