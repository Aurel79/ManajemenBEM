# Panduan Role-Based Access Control (RBAC) di Mobile App

## Overview

Aplikasi My BEM menggunakan sistem role-based untuk mengatur tampilan dan akses berdasarkan role user. Setiap user akan diarahkan ke dashboard yang sesuai dengan role-nya setelah login.

## Roles yang Didukung

1. **Super Admin / Admin**
   - Dashboard: `AdminDashboard`
   - Akses: Full access ke semua fitur
   - Menu: Manajemen User, Proposal, Program Kerja, Laporan, Pengaturan

2. **Presiden**
   - Dashboard: `PresidenDashboard`
   - Akses: Review proposal, program kerja, anggota BEM, laporan
   - Menu: Review Proposal, Program Kerja, Anggota BEM, Laporan

3. **Menteri**
   - Dashboard: `MenteriDashboard`
   - Akses: Proposal sendiri, buat proposal, program kerja, anggota kementerian
   - Menu: Proposal Saya, Buat Proposal, Program Kerja, Anggota Kementerian

4. **Anggota**
   - Dashboard: `AnggotaDashboard`
   - Akses: Proposal sendiri, buat proposal, program kerja
   - Menu: Proposal Saya, Buat Proposal, Program Kerja

## Struktur File

```
MobileVersion/
├── src/
│   ├── contexts/
│   │   └── AuthContext.js          # Context untuk manage auth & role
│   ├── screens/
│   │   ├── LoginScreen.js          # Login dengan role detection
│   │   ├── AdminDashboard.js      # Dashboard untuk Admin
│   │   ├── PresidenDashboard.js   # Dashboard untuk Presiden
│   │   ├── MenteriDashboard.js    # Dashboard untuk Menteri
│   │   └── AnggotaDashboard.js    # Dashboard untuk Anggota
│   └── services/
│       └── authService.js         # Service untuk API auth
└── App.js                          # Main app dengan role-based routing
```

## Cara Kerja

### 1. Login & Role Detection

Saat user login:
1. Backend mengembalikan `roles` sebagai array (misal: `["Super Admin"]`)
2. `AuthContext` menyimpan user data termasuk roles
3. `App.js` menentukan dashboard berdasarkan primary role
4. User diarahkan ke dashboard yang sesuai

### 2. Role Priority

Jika user memiliki multiple roles, priority:
1. Super Admin
2. Admin
3. Presiden
4. Menteri
5. Anggota

### 3. AuthContext Functions

```javascript
const { 
  user,              // User data dengan roles
  isAuthenticated,   // Status login
  hasRole,           // Check role tertentu
  hasAnyRole,        // Check multiple roles
  isAdmin,           // Check admin
  isPresiden,        // Check presiden
  isMenteri,         // Check menteri
  isAnggota,         // Check anggota
  getPrimaryRole,    // Get primary role
  login,             // Login function
  logout,            // Logout function
} = useAuth();
```

## Contoh Penggunaan

### Check Role di Component

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { hasRole, isAdmin, user } = useAuth();

  if (isAdmin()) {
    // Show admin features
  }

  if (hasRole('Presiden')) {
    // Show presiden features
  }

  return (
    <View>
      <Text>Role: {user?.roles?.join(', ')}</Text>
    </View>
  );
}
```

### Conditional Rendering

```javascript
const { hasRole } = useAuth();

{hasRole('Super Admin') && (
  <TouchableOpacity>
    <Text>Admin Only Button</Text>
  </TouchableOpacity>
)}
```

### Protected Navigation

```javascript
const { isAdmin } = useAuth();

const handleNavigate = () => {
  if (isAdmin()) {
    navigation.navigate('AdminScreen');
  } else {
    Alert.alert('Akses Ditolak', 'Hanya admin yang bisa akses');
  }
};
```

## Menambah Role Baru

1. **Buat Dashboard Screen Baru**:
```javascript
// src/screens/NewRoleDashboard.js
import { useAuth } from '../contexts/AuthContext';

const NewRoleDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  // ... dashboard content
};
```

2. **Update App.js**:
```javascript
import NewRoleDashboard from './src/screens/NewRoleDashboard';

// Di Stack.Navigator
<Stack.Screen name="NewRoleDashboard" component={NewRoleDashboard} />

// Di getDashboardScreen()
case 'New Role':
  return 'NewRoleDashboard';
```

3. **Update AuthContext** (optional):
```javascript
const isNewRole = () => {
  return hasRole('New Role');
};
```

## Testing

1. Login dengan user yang memiliki role berbeda
2. Pastikan redirect ke dashboard yang sesuai
3. Test logout dari setiap dashboard
4. Test conditional rendering berdasarkan role

## Catatan

- Role data berasal dari backend API (`/api/v1/login` dan `/api/v1/me`)
- Backend menggunakan Spatie Permission untuk role management
- Role disimpan di AsyncStorage bersama user data
- Setelah logout, user data dan roles dihapus dari storage

---

**Happy Coding! 🚀**

