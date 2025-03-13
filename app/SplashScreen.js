import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animasyonlar için değerler
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Logo rotasyon değerini hesaplama
  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    console.log("SplashScreen bileşeni yüklendi!");
    
    // Arka plan animasyonu
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Logo animasyonu - dönen logo efekti
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();
    
    // Logo büyüme animasyonu
    setTimeout(() => {
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 8,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }, 800);
    
    // Metin animasyonu
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    }, 1200);
    
    // İlerleme çubuğu animasyonu - Daha erken başlatıyorum
    setTimeout(() => {
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 4500, // Daha uzun sürede dolacak, böylece daha görünür olacak
        useNativeDriver: false,
      }).start();
    }, 800); // Daha erken başlamasını sağladım

    // İlerleme çubuğu animasyonu - Hemen başlıyor
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 4000, // Toplam splash screen süresi ile uyumlu
      useNativeDriver: false,
    }).start();

    // Tüm ekran geçiş animasyonu
    setTimeout(() => {
      // Minimum 4 saniye gösterim süresini garantileyelim
      const minDisplayTime = 4000; // 4 saniye
      const currentTime = new Date().getTime();
      const startTime = useRef(new Date().getTime()).current;
      const elapsedTime = currentTime - startTime;
      
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          console.log("Splash screen animasyonu tamamlandı, ana ekrana geçiliyor...");
          if (onFinish) {
            onFinish();
          }
        });
      }, remainingTime);
    }, 5000); // Toplam gösterim süresini arttırdım, ilerleme çubuğunun tam dolduğunu görmek için
  }, []);

  // İlerleme çubuğu genişliği
  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Animated.View style={[styles.background, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={['#4A3F69', '#2E2A4A']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: spin }
            ] 
          }
        ]}
      >
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.Text 
        style={[
          styles.appName, 
          { 
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }]
          }
        ]}
      >
        Gardrops
      </Animated.Text>
      
      {/* İlerleme çubuğu - Ekranın alt kısmına yerleştiriyorum */}
      <Animated.View 
        style={[
          styles.progressBarContainer, 
          { 
            opacity: 1, // Her zaman görünür
            position: 'absolute',
            bottom: 120, // Ekranın altına yakın bir konum
            transform: [] // Transform'ları kaldırdım
          }
        ]}
      >
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressBarWidth }
            ]} 
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    marginTop: 40,
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  progressBarContainer: {
    marginTop: 40,
    width: width * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 10,
  },
  progressBarBackground: {
    height: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 8,
  }
});

export default SplashScreen; 