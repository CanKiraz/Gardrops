import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { COLORS } from './constants/colors';

const { width } = Dimensions.get('window');

export default function CustomSplashScreen({ onFinish }) {
  const loadingWidth = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textPosition = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Metin animasyonu
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textPosition, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Yükleme animasyonu
    Animated.timing(loadingWidth, {
      toValue: width - 80, // Ekran genişliğinden biraz daha dar
      duration: 2000, // 2 saniye sürecek
      useNativeDriver: false,
    }).start(() => {
      // Animasyon tamamlandığında splash screen'i kapat
      setTimeout(() => {
        onFinish();
      }, 200);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Animated.Text 
          style={[
            styles.logoText,
            { 
              opacity: textOpacity,
              transform: [{ translateY: textPosition }]
            }
          ]}
        >
          Gardrops
        </Animated.Text>
      </View>
      
      {/* Yükleme çubuğu çerçevesi */}
      <View style={styles.loadingBarContainer}>
        <Animated.View
          style={[
            styles.loadingBar,
            {
              width: loadingWidth,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.splash,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingBarContainer: {
    width: width - 80,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingBar: {
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
}); 