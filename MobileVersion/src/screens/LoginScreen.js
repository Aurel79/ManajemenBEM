import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const LoginScreen = ({ navigation }) => {
  const { login, getPrimaryRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideErrorModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setErrorModalVisible(false);
    });
  };

  const getDashboardScreen = (userRoles) => {
    if (!userRoles || userRoles.length === 0) {
      return 'Welcome';
    }

    // Priority sesuai dengan DatabaseSeeder
    const priority = [
      'Super Admin',
      'Admin',
      'Presiden BEM',
      'Presiden',
      'Wakil Presiden BEM',
      'Sekretaris',
      'Bendahara',
      'Menteri',
      'Anggota'
    ];
    
    for (const role of priority) {
      if (userRoles.includes(role)) {
        // Mapping role ke dashboard
        if (role === 'Super Admin' || role === 'Admin' || role === 'Sekretaris' || role === 'Bendahara') {
          return 'AdminDashboard';
        }
        if (role === 'Presiden BEM' || role === 'Presiden' || role === 'Wakil Presiden BEM') {
          return 'PresidenDashboard';
        }
        if (role === 'Menteri') {
          return 'MenteriDashboard';
        }
        if (role === 'Anggota') {
          return 'AnggotaDashboard';
        }
      }
    }
    return 'Welcome';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorModal('Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      // Redirect ke dashboard sesuai role
      const dashboardScreen = getDashboardScreen(response.user?.roles);
      navigation.replace(dashboardScreen);
    } catch (error) {
      let errorMsg = 'Login gagal. Silakan coba lagi.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showErrorModal(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#9A0020', '#000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Section - Outside Card */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.tagline}>Organizing your BEM is easier with MY BEM.</Text>
          </View>

          {/* Login Card */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.001)']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.form}>
            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#030001','#97011E']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Error Modal */}
      <Modal
        transparent
        visible={errorModalVisible}
        animationType="fade"
        onRequestClose={hideErrorModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(73, 39, 39, 0.95)', 'rgba(53, 14, 14, 0.98)']}
              style={styles.modalCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Error Icon */}
              <View style={styles.errorIconContainer}>
                <LinearGradient
                  colors={['#FF4444', '#CC0000']}
                  style={styles.errorIconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="close-circle" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Error Title */}
              <Text style={styles.errorTitle}>Oops!</Text>

              {/* Error Message */}
              <Text style={styles.errorMessage}>{errorMessage}</Text>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.errorButton}
                onPress={hideErrorModal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#030001', '#97011E']}
                  style={styles.errorButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.errorButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.08,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  welcomeSection: {
    marginBottom: isSmallScreen ? 20 : 30,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: isSmallScreen ? 32 : 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: isSmallScreen ? 20 : 22,
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 16,
    padding: isSmallScreen ? 20 : 30,
    marginTop: isSmallScreen ? 15 : 20,
    minHeight: height * 0.3,
  },
  cardContent: {
    flex: 1,
  },
  form: {
    marginTop: isSmallScreen ? 10 : 20,
  },
  inputContainer: {
    marginBottom: isSmallScreen ? 18 : 24,
  },
  inputLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: isSmallScreen ? 48 : 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 15 : 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  signInButton: {
    marginTop: isSmallScreen ? 20 : 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: isSmallScreen ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
  },
  // Error Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  errorButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  errorButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

