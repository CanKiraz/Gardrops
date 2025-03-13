import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import CustomSplashScreen from './SplashScreen';

// Splash ekranının otomatik kapanmasını engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Uygulama hazırlıkları burada yapılır (font yükleme vb.)
        // Burada beklemek için bir timeout ekleyebiliriz
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Uygulama hazır olduğunda
        setIsReady(true);
        // Native splash screen'i kapat
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  // Eğer hala splash gösteriliyorsa özel splash screen'i göster
  if (showSplash) {
    return (
      <CustomSplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // Ana uygulamayı göster
  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
} 