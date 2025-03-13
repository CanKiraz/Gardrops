import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Ana renk paleti - Ana sayfadaki ile aynı
const COLORS = {
  primary: '#8D6E63',       // Orta kahverengi
  primaryDark: '#5D4037',   // Koyu kahverengi
  primaryLight: '#D7CCC8',  // Açık kahverengi/bej
  background: '#F5F5F5',    // Açık gri (eski sarımsı yerine)
  accent: '#4E342E',        // Çok koyu kahverengi vurgu
  textDark: '#3E2723',      // Koyu metin
  textMedium: '#8D6E63',    // Orta metin
  textLight: '#D7CCC8',     // Açık metin
  cardBg: '#FFFFFF',        // Kart arka planı
  borderColor: '#BCAAA4',   // Kenarlık rengi
};

// Menü öğesi bileşeni
const MenuItem = ({ icon, title, subtitle }) => {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={COLORS.accent} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.borderColor} />
    </TouchableOpacity>
  );
};

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileTopSection}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfoContainer}>
              <Text style={styles.profileName}>Ahmet Yılmaz</Text>
              <Text style={styles.profileUsername}>@ahmetyilmaz</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>41</Text>
              <Text style={styles.statLabel}>Parça</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Kombin</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Favori</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <MenuItem 
            icon="account-edit" 
            title="Profili Düzenle" 
          />
          <MenuItem 
            icon="shield-lock" 
            title="Gizlilik Ayarları" 
          />
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <MenuItem 
            icon="cog" 
            title="Ayarlar" 
          />
          <MenuItem 
            icon="help-circle" 
            title="Yardım ve Destek" 
          />
          <MenuItem 
            icon="information" 
            title="Hakkında" 
            subtitle="Versiyon 1.0.0" 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
  },
  profileTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.cardBg,
  },
  profileInfoContainer: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.cardBg,
  },
  profileUsername: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textMedium,
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 10,
    color: COLORS.textDark,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 80,
  },
}); 