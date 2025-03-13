import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Ana renkler
const COLORS = {
  background: '#0A0C1E', // Koyu lacivert
  primary: '#6C3CE9',    // Mor
  secondary: '#42B5FF',  // Mavi
  accent: '#FF375F',     // Pembe
  textLight: '#FFFFFF',
  textMedium: '#B8B8D0',
  textDark: '#8A8A9D',
  cardBg: 'rgba(30, 34, 66, 0.7)',
  gradientStart: '#6C3CE9',
  gradientMiddle: '#42B5FF',
  gradientEnd: '#FF375F',
};

// Parlayan animasyonlu yapay zeka butonu
const AnimatedAIButton = () => {
  // Animasyon değerleri
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // İkon animasyonu
  useEffect(() => {
    // Nabız animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Parlama animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        })
      ])
    ).start();

    // Dönme animasyonu (dış halka için)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Animasyon değişkenlerini interpolate et
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8]
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.aiButtonContainer}>
      {/* Dönen dış halka */}
      <Animated.View
        style={[
          styles.rotatingRing,
          {
            transform: [{ rotate }]
          }
        ]}
      >
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ringGradient}
        />
      </Animated.View>

      {/* Ana buton gövdesi */}
      <TouchableOpacity style={styles.aiButton}>
        <Animated.View
          style={[
            styles.aiButtonInner,
            {
              transform: [{ scale }]
            }
          ]}
        >
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <MaterialCommunityIcons
              name="brain"
              size={60}
              color={COLORS.textLight}
              style={styles.aiIcon}
            />
          </LinearGradient>
        </Animated.View>

        {/* Parıltı efekti */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
            }
          ]}
        >
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default function Wardrobe() {
  // Ekran boyutlarını al
  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6C3CE9', '#42B5FF', '#FF375F']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Ana içerik bölümü */}
            <View style={styles.mainContent}>
              {/* Kombin Üreteci İçeriği */}
              <View style={styles.contentContainer}>
                <Text style={styles.aiCardTitle}>Hadi Kombinin Oluşturalım</Text>
                <Text style={styles.aiCardDescription}>
                  Yapay zeka ile tarzınıza uygun benzersiz kombinler oluşturun
                </Text>

                <AnimatedAIButton />

                <Text style={styles.aiCardHint}>
                  Dokunun ve yapay zeka ile kombinlerinizi oluşturmaya başlayın
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Tab bar için extra padding
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height - 150,
  },
  // İçerik Container
  contentContainer: {
    alignItems: 'center',
    padding: 24,
  },
  aiCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aiCardDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiButtonContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  rotatingRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ringGradient: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  aiButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aiButtonInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aiButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  aiCardHint: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
}); 