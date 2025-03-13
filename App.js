import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomSplashScreen from './app/SplashScreen';
import LogoTestScreen from './app/LogoTestScreen';

// Ana ekran bileşeni
const HomeScreen = ({ onShowLogo }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>Kombinler burada listelenecek</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Logoyu Görüntüle" 
          onPress={onShowLogo} 
          color="#4A3F69"
        />
      </View>
    </View>
  );
};

// Dolap ekranı bileşeni
const WardrobeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dolabım</Text>
    </View>
  );
};

// Profil ekranı bileşeni
const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 20,
  }
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoTest, setShowLogoTest] = useState(false);
  
  // StatusBar ayarları
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#4A3F69');
    }
  }, []);
  
  // Logo test ekranını göster
  if (showLogoTest) {
    return <LogoTestScreen onBack={() => setShowLogoTest(false)} />;
  }
  
  // Kendi özel splash screen'imizi göster - Uygulamanın açılışında her zaman gösteriyoruz
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <CustomSplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }
  
  // Uygulama ana ekranı
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#888888',
          headerShown: true,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        <Tab.Screen
          name="Ana Menü"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={28} color={color} />
            ),
          }}
        >
          {() => <HomeScreen onShowLogo={() => setShowLogoTest(true)} />}
        </Tab.Screen>
        <Tab.Screen
          name="Dolap"
          component={WardrobeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="tshirt-crew" size={28} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 