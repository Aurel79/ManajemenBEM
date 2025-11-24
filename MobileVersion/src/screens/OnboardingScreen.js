import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slideData = [
  { 
    id: '1', 
    image: require('../../assets/gambardepan1.png'),
    title: 'Manajemen\nProposal',
    description: 'Pantau proses persetujuan\ndalam satu aplikasi'
  },
  { 
    id: '2', 
    image: require('../../assets/gambardepan2.png'),
    title: 'Monitoring\nKegiatan',
    description: 'Lihat status kegiatan, timeline, dan\nprogres setiap event.'
  },
  { 
    id: '3', 
    image: require('../../assets/gambardepan3.png'),
    title: 'Data Anggota\nTerorganisir',
    description: 'Akses data pengurus, peran, dan\nstatus aktif kapan saja.'
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState(1); // 1 = My BEM, 2 = Logo BEM, 3 = Slides
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef(null);
  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Define all refs and configs before early returns
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleFinish = async () => {
    try {
      // DEVELOPMENT: Comment untuk selalu reset onboarding
      // PRODUCTION: Uncomment baris di bawah
      // await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      console.log('✅ Onboarding finished - navigating to Login');
      navigation.replace('Login');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    if (currentScreen === 1) {
      // Screen pertama: auto next ke screen 2 setelah 3 detik
      const timer = setTimeout(() => {
        setCurrentScreen(2);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentScreen === 2) {
      // Screen kedua: auto next ke screen 3 (slides) setelah 3 detik
      const timer = setTimeout(() => {
        setCurrentScreen(3);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Handle next slide (manual)
  const handleNextSlide = () => {
    if (currentSlideIndex < slideData.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // Last slide, go to Login
      handleFinish();
    }
  };

  // Screen 1: My BEM dengan gradient
  if (currentScreen === 1) {
    if (!fontsLoaded) {
      return null; // Atau bisa return loading indicator
    }
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B0000', '#000000']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { fontFamily: 'Lobster_400Regular' }]}>My BEM</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Screen 2: Logo BEM di tengah dengan footer di bawah
  if (currentScreen === 2) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B0000', '#000000']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.contentLogo}>
            <Image
              source={require('../../assets/logobem.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Badan Eksekutif Mahasiswa</Text>
            <Text style={styles.footerText}>Telkom University Surabaya</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Screen 3: Slide pages dengan gambar
  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slideContainer}>
        <LinearGradient
          colors={['#FFE5E5', '#FFFFFF']}
          style={styles.slideGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.slideContent}>
            <Image
              source={item.image}
              style={styles.slideImage}
              resizeMode="contain"
            />
            <View style={styles.slideTextContainer}>
              <Text style={[styles.slideTitle, fontsLoaded && { fontFamily: 'Montserrat_700Bold' }]}>{item.title}</Text>
              <Text style={[styles.slideDescription, fontsLoaded && { fontFamily: 'Montserrat_400Regular' }]}>{item.description}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleFinish}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>
      
      <FlatList
        ref={flatListRef}
        data={slideData}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slideData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentSlideIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNextSlide}
      >
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 30,
    right: 10,
    zIndex: 10,
    padding: 10,
    opacity: 0.5,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.1, // Diperbesar dari 0.6 menjadi 0.75
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  contentLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 4,
  },
  slideContainer: {
    width: width,
    height: height,
    minHeight: height,
  },
  slideGradient: {
    width: width,
    height: height,
    minHeight: height,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  slideImage: {
    width: width * 0.7,
    height: height * 0.4,
    marginBottom: 50,
  },
  slideTextContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    width: '100%',
    marginTop: 20,
    marginLeft: 20,
      
  },
  slideTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'left',
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.1,
    left: 30,
  },
  dot: {
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#999',
    marginRight: 6,
    marginLeft: 6,
  },
  dotActive: {
    backgroundColor: '#800000',
    width: 24,
    height: 3,
  },
  nextButton: {
    position: 'absolute',
    bottom: height * 0.08,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default OnboardingScreen;

