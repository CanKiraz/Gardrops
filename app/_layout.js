import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';

// Özel Tab Bar bileşeni 
const CustomTabBar = () => {
  const pathname = usePathname();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          router.push('/');
        }}
      >
        <View style={[
          styles.tabIconContainer,
          (pathname === '/' || pathname === '/index') ? styles.activeTab : null
        ]}>
          <MaterialCommunityIcons
            name="home"
            size={28}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          router.push('/wardrobe');
        }}
      >
        <View style={[
          styles.tabIconContainer,
          pathname === '/wardrobe' ? styles.activeTab : null
        ]}>
          <Text style={styles.brainEmoji}>🧠</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          router.push('/profile');
        }}
      >
        <View style={[
          styles.tabIconContainer,
          pathname === '/profile' ? styles.activeTab : null
        ]}>
          <MaterialCommunityIcons
            name="account"
            size={28}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Gösterdiğimiz custom tab bar'ı kullanacağız
        }
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : undefined // iOS fix
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  brainEmoji: {
    fontSize: 24,
  }
}); 