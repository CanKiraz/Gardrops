import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform, Modal, Alert, Switch, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Camera } from 'expo-camera';

// Kamera tipini belirle
const CAMERA_TYPE = Camera.Constants?.Type?.back || 0;

// Kategori Resimleri
const KATEGORI_IMAGES = {
  disGiyim: require('../assets/images/Dış_Giyim.png'),
  ustGiyim: require('../assets/images/Üst_Giyim.png'),
  altGiyim: require('../assets/images/Alt_Giyim.png'),
  resmiGiyim: require('../assets/images/Resmi_Giyim.png'),
  ayakkabi: require('../assets/images/Ayakkabı.png'),
  aksesuar: require('../assets/images/Aksesuar (2).png'),
};

// Kategori ikonları için material community icons isimleri (sadece kıyafet detay sayfalarında kullanılacak)
const ICONS = {
  disGiyim: "coat-rack",
  ustGiyim: "tshirt-crew",
  altGiyim: "human-female",
  resmiGiyim: "hanger",
  ayakkabi: "shoe-heel",
  aksesuar: "glasses",
};

// Renk paleti - Modern Kahverengi
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
  today: '#A1887F',         // Bugünün rengi
  weatherIcon: '#9E9E9E',   // Hava durumu simgesi rengi
  cardColor: '#6D4C41',     // Kart içi rengini daha koyu bir kahverengiye değiştirdim
  categoryColors: [
    '#8D6E63',              // Kategori rengi 1
    '#795548',              // Kategori rengi 2
    '#6D4C41',              // Kategori rengi 3
    '#5D4037',              // Kategori rengi 4
    '#4E342E',              // Kategori rengi 5
  ],
};

// Takvim Günü bileşeni 
const TakvimGunu = ({ tarih, secili, bugun, gunAdi }) => {
  return (
    <View style={styles.gunWrapper}>
      <Text style={styles.gunAdiText}>{gunAdi}</Text>
      <View style={[
        styles.gunContainer,
        secili ? styles.seciliGun : null,
        bugun ? styles.bugunGun : null
      ]}>
        {bugun && <View style={styles.bugunNoktasi} />}
        <Text style={[
          styles.gunText,
          secili ? styles.seciliGunText : null,
          bugun ? styles.bugunGunText : null
        ]}>
          {tarih}
        </Text>
      </View>

      {/* Hava durumu ikonu */}
      <View style={styles.havaDurumuContainer}>
        <MaterialCommunityIcons
          name="cloud-question"
          size={18}
          color={COLORS.weatherIcon}
        />
      </View>
    </View>
  );
};

// Kategori Kartı bileşeni
const KategoriKarti = ({ baslik, ikonAdi, kiyafetSayisi, onPress, image }) => {
  return (
    <TouchableOpacity
      style={styles.kategoriKart}
      onPress={onPress}
    >
      <View style={styles.kategoriIcKonteyner}>
        {/* Kategori ikonu yerine resim kullan */}
        <View style={styles.kategoriIkonContainer}>
          <Image
            source={image}
            style={styles.kategoriResim}
            resizeMode="contain"
          />
        </View>

        {/* Kategori bilgisi */}
        <View style={styles.kategoriMetinContainer}>
          <Text style={styles.kategoriBaslik} numberOfLines={1} ellipsizeMode="tail">{baslik}</Text>
          <Text style={styles.kiyafetSayisi} numberOfLines={1}>{kiyafetSayisi} parça</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Boş kategori durumu için bileşen
const BosGardrop = () => {
  return (
    <View style={styles.bosGardropContainer}>
      <Image
        source={{ uri: 'https://i.pinimg.com/originals/69/20/fc/6920fc266ea0a8bfbb02561dfbd40d97.png' }}
        style={{ width: 100, height: 100, tintColor: COLORS.primary }}
        resizeMode="contain"
      />
      <Text style={styles.bosGardropBaslik}>Gardrobunuz Boş</Text>
      <Text style={styles.bosGardropMesaj}>
        Gardrobunuzu oluşturmak için kıyafetlerinizi ekleyin.
      </Text>
      <TouchableOpacity style={styles.kiyafetEkleButon}>
        <Text style={styles.kiyafetEkleButonText}>Kıyafet Ekle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Home() {
  const [seciliGun, setSeciliGun] = useState(null);
  const [bugunTarihi, setBugunTarihi] = useState(null);
  const [haftaninGunleri, setHaftaninGunleri] = useState([]);
  const [ayAdi, setAyAdi] = useState('');
  const [haftaOffset, setHaftaOffset] = useState(0);
  const [seciliKategori, setSeciliKategori] = useState(null);
  const [tumKiyafetleriGoster, setTumKiyafetleriGoster] = useState(false);
  const [bilgilendirmeModalVisible, setBilgilendirmeModalVisible] = useState(false);
  const [bilgilendirmeyiGosterme, setBilgilendirmeyiGosterme] = useState(false);
  const [kameraIzni, setKameraIzni] = useState(null);
  const [kameraAcik, setKameraAcik] = useState(false);
  const [onFotograf, setOnFotograf] = useState(null);
  const [arkaFotograf, setArkaFotograf] = useState(null);
  const [aktifFotograf, setAktifFotograf] = useState(1); // 1: ön fotoğraf, 2: arka fotoğraf
  const [onayModalVisible, setOnayModalVisible] = useState(false);
  const [basariModalVisible, setBasariModalVisible] = useState(false);
  const cameraRef = useRef(null);

  const screenWidth = Dimensions.get('window').width;
  const pathname = usePathname(); // Aktif sayfayı takip etmek için

  // Örnek kullanıcı kıyafet verisi - Gerçek uygulamada bir API'den gelecek
  const [kullaniciKiyafetleri, setKullaniciKiyafetleri] = useState([
    { id: 1, tur: 'Üst Giyim', alt_tur: 'Tişört', isim: 'Beyaz Tişört', ikon: 'tshirt-crew', image: KATEGORI_IMAGES.ustGiyim },
    { id: 2, tur: 'Üst Giyim', alt_tur: 'Tişört', isim: 'Siyah Tişört', ikon: 'tshirt-crew', image: KATEGORI_IMAGES.ustGiyim },
    { id: 3, tur: 'Üst Giyim', alt_tur: 'Gömlek', isim: 'Mavi Gömlek', ikon: 'tshirt-crew-outline', image: KATEGORI_IMAGES.ustGiyim },
    { id: 4, tur: 'Alt Giyim', alt_tur: 'Pantolon', isim: 'Kot Pantolon', ikon: 'human-female', image: KATEGORI_IMAGES.altGiyim },
    { id: 5, tur: 'Alt Giyim', alt_tur: 'Pantolon', isim: 'Siyah Pantolon', ikon: 'human-female', image: KATEGORI_IMAGES.altGiyim },
    { id: 6, tur: 'Dış Giyim', alt_tur: 'Ceket', isim: 'Kot Ceket', ikon: 'coat-rack', image: KATEGORI_IMAGES.disGiyim },
    { id: 7, tur: 'Ayakkabı', alt_tur: 'Spor ayakkabı', isim: 'Beyaz Spor Ayakkabı', ikon: 'shoe-heel', image: KATEGORI_IMAGES.ayakkabi },
    { id: 8, tur: 'Aksesuar', alt_tur: 'Şapka', isim: 'Siyah Şapka', ikon: 'glasses', image: KATEGORI_IMAGES.aksesuar },
    { id: 9, tur: 'Resmi Giyim', alt_tur: 'Takım Elbise', isim: 'Kahverengi Takım Elbise', ikon: 'hanger', image: KATEGORI_IMAGES.resmiGiyim },
    // Aynı kategoride birden fazla kıyafet ekleyelim
    { id: 10, tur: 'Resmi Giyim', alt_tur: 'Gömlek', isim: 'Beyaz Gömlek', ikon: 'hanger', image: KATEGORI_IMAGES.resmiGiyim },
    { id: 11, tur: 'Resmi Giyim', alt_tur: 'Pantolon', isim: 'Kumaş Pantolon', ikon: 'hanger', image: KATEGORI_IMAGES.resmiGiyim },
    // Örnek olarak bu kıyafetleri ekledim
  ]);

  // Kategorilerin tanımları - Tüm kartlarda aynı renk kullanılacak
  const tumKategoriler = [
    {
      id: 1,
      baslik: 'Dış Giyim',
      ikon: ICONS.disGiyim,
      renk: COLORS.cardColor,
      aciklama: 'Mont, Kaban, Ceket, Trençkot, Yağmurluk, Yelek',
      image: KATEGORI_IMAGES.disGiyim
    },
    {
      id: 2,
      baslik: 'Üst Giyim',
      ikon: ICONS.ustGiyim,
      renk: COLORS.cardColor,
      aciklama: 'Tişört, Gömlek, Sweatshirt, Kazak, Hırka, Bluz',
      image: KATEGORI_IMAGES.ustGiyim
    },
    {
      id: 3,
      baslik: 'Alt Giyim',
      ikon: ICONS.altGiyim,
      renk: COLORS.cardColor,
      aciklama: 'Pantolon, Eşofman altı, Şort, Tayt, Etek',
      image: KATEGORI_IMAGES.altGiyim
    },
    {
      id: 4,
      baslik: 'Resmi Giyim',
      ikon: ICONS.resmiGiyim,
      renk: COLORS.cardColor,
      aciklama: 'Takım Elbise, Blazer, Gömlek, Resmi Pantolon',
      image: KATEGORI_IMAGES.resmiGiyim
    },
    {
      id: 5,
      baslik: 'Ayakkabı',
      ikon: ICONS.ayakkabi,
      renk: COLORS.cardColor,
      aciklama: 'Spor ayakkabı, Bot, Sandalet, Terlik',
      image: KATEGORI_IMAGES.ayakkabi
    },
    {
      id: 6,
      baslik: 'Aksesuar',
      ikon: ICONS.aksesuar,
      renk: COLORS.cardColor,
      aciklama: 'Şapka, Bere, Eldiven, Atkı, Çanta',
      image: KATEGORI_IMAGES.aksesuar
    }
  ];

  // Kullanıcının yüklediği kıyafetlere göre kategorileri hesapla
  const aktifKategoriler = tumKategoriler.filter(kategori => {
    // Kategori başlığına göre ilgili kıyafetleri filtrele
    const kategoridekiKiyafetler = kullaniciKiyafetleri.filter(
      kiyafet => kiyafet.tur === kategori.baslik
    );
    // Eğer kategoride en az bir kıyafet varsa, o kategoriyi göster
    return kategoridekiKiyafetler.length > 0;
  }).map(kategori => {
    // Her kategori için o kategorideki kıyafet sayısını hesapla
    const kiyafetSayisi = kullaniciKiyafetleri.filter(
      kiyafet => kiyafet.tur === kategori.baslik
    ).length;

    // Kategori objesini kıyafet sayısı ile genişlet
    return {
      ...kategori,
      kiyafetSayisi
    };
  });

  // Haftaları hesapla
  const hesaplaHaftalar = (offset = 0) => {
    const bugun = new Date();

    // Haftanın başlangıç gününü hesapla (Pazartesi)
    const haftaninBaslangici = new Date(bugun);
    const bugunGunu = bugun.getDay() || 7; // Pazar günü 0 yerine 7 olarak ele alıyoruz
    const pazartesiyeUzaklik = bugunGunu - 1;
    haftaninBaslangici.setDate(bugun.getDate() - pazartesiyeUzaklik + (offset * 7));

    // Gün adları
    const gunAdlari = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    // Haftanın 7 gününü oluştur
    const gunler = [];
    for (let i = 0; i < 7; i++) {
      const tarih = new Date(haftaninBaslangici);
      tarih.setDate(haftaninBaslangici.getDate() + i);
      gunler.push({
        gun: tarih.getDate(),
        ay: tarih.getMonth(),
        yil: tarih.getFullYear(),
        tamTarih: new Date(tarih),
        gunAdi: gunAdlari[i]
      });
    }

    return gunler;
  };

  // Haftanın günlerini ve bugünün tarihini hesapla
  useEffect(() => {
    const bugun = new Date();
    // Bugünün tarihini ayarla
    setBugunTarihi(bugun.getDate());
    // Başlangıçta bugünün seçili olmasını sağla
    setSeciliGun(bugun.getDate());

    // Ay adını ayarla
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    setAyAdi(aylar[bugun.getMonth()]);

    // İlk haftayı hesapla (offset: 0)
    setHaftaninGunleri(hesaplaHaftalar(0));
  }, []);

  // Hafta değiştiğinde çalışacak
  useEffect(() => {
    const gunler = hesaplaHaftalar(haftaOffset);
    setHaftaninGunleri(gunler);

    // Ay adını güncelle
    const ilkGun = gunler[0];
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    setAyAdi(aylar[ilkGun.ay]);
  }, [haftaOffset]);

  // Önceki haftaya git
  const oncekiHafta = () => {
    setHaftaOffset(haftaOffset - 1);
  };

  // Sonraki haftaya git
  const sonrakiHafta = () => {
    setHaftaOffset(haftaOffset + 1);
  };

  // Kategori seçildiğinde
  const kategoriSec = (kategoriId) => {
    console.log(`Kategori seçildi: ${kategoriId}`);
    // Seçilen kategoriyi state'e kaydet
    const secilenKategori = tumKategoriler.find(k => k.id === kategoriId);
    setSeciliKategori(secilenKategori);
  };

  // Tümünü göster butonuna tıklandığında
  const tumunuGoster = () => {
    setTumKiyafetleriGoster(true);
    setSeciliKategori(null);
  };

  // Ana listeye dön (kategorileri göster)
  const anaListeyeDon = () => {
    setSeciliKategori(null);
    setTumKiyafetleriGoster(false);
  };

  // Yeni kıyafet ekleme işlemi için bilgilendirme modalını aç
  const yeniKiyafetEkle = async () => {
    if (bilgilendirmeyiGosterme) {
      try {
        // Sadece kamera izni iste
        const { status } = await Camera.requestCameraPermissionsAsync();
        
        if (status === 'granted') {
          setKameraIzni(true);
          setKameraAcik(true);
        } else {
          Alert.alert('Kamera İzni Gerekli', 'Kıyafet eklemek için kamera izni vermeniz gerekmektedir.');
        }
      } catch (error) {
        console.log("Kamera izni hatası:", error);
        Alert.alert('Hata', 'Kamera izni alınırken bir hata oluştu.');
      }
    } else {
      setBilgilendirmeModalVisible(true);
    }
  };

  // Fotoğraf çekme işlemi
  const fotografCek = async () => {
    if (cameraRef.current) {
      try {
        const foto = await cameraRef.current.takePictureAsync();
        // Hangi fotoğrafı çektiğimize göre state'i güncelle
        if (aktifFotograf === 1) {
          setOnFotograf(foto.uri);
        } else {
          setArkaFotograf(foto.uri);
        }
        // Onay modalını göster
        setOnayModalVisible(true);
      } catch (error) {
        Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
      }
    }
  };

  // Fotoğrafı onayla
  const fotografiOnayla = () => {
    setOnayModalVisible(false);
    // Eğer ön fotoğraf çekilmişse, arka fotoğrafa geç
    if (aktifFotograf === 1) {
      setAktifFotograf(2);
    } else {
      // Eğer arka fotoğraf da çekilmişse, kamerayı kapat ve başarı modalını göster
      setKameraAcik(false);
      setBasariModalVisible(true);
      
      // Yeni kıyafet ekle (örnek olarak üst giyim kategorisine)
      const yeniKiyafet = {
        id: kullaniciKiyafetleri.length + 1,
        tur: 'Üst Giyim',
        alt_tur: 'Tişört',
        isim: `Kıyafet ${kullaniciKiyafetleri.length + 1}`,
        ikon: 'tshirt-crew',
        image: KATEGORI_IMAGES.ustGiyim
      };
      
      setKullaniciKiyafetleri([...kullaniciKiyafetleri, yeniKiyafet]);
    }
  };

  // Yeniden fotoğraf çek
  const yenidenCek = () => {
    setOnayModalVisible(false);
    // Aktif fotoğrafı sıfırla
    if (aktifFotograf === 1) {
      setOnFotograf(null);
    } else {
      setArkaFotograf(null);
    }
  };

  // Ana menüye dön
  const anaMenuyeDon = () => {
    setBasariModalVisible(false);
    setOnFotograf(null);
    setArkaFotograf(null);
    setAktifFotograf(1);
  };

  // Seçili kategorideki kıyafetleri filtrele
  const secilenKategoridekiKiyafetler = seciliKategori
    ? kullaniciKiyafetleri.filter(kiyafet => kiyafet.tur === seciliKategori.baslik)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, </Text>
            <Text style={styles.name}>Ahmet</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
        </View>

        {/* Takvim Kartı - En yukarıya taşındı */}
        <View style={styles.takvimKartContainer}>
          <View style={styles.takvimKart}>
            {/* Ay Bilgisi ve Navigasyon */}
            <View style={styles.takvimBasliklar}>
              <TouchableOpacity onPress={oncekiHafta} style={styles.navButtonLeft}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={COLORS.textDark}
                />
              </TouchableOpacity>
              <Text style={styles.takvimBaslik}>{ayAdi}</Text>
              <TouchableOpacity onPress={sonrakiHafta} style={styles.navButtonRight}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textDark}
                />
              </TouchableOpacity>
            </View>

            {/* Takvim Günleri */}
            <View style={styles.takvimSatiri}>
              {haftaninGunleri.map((gunBilgisi) => {
                // Key hatasını önlemek için değerleri kontrol et
                const gunKey = `gun-${gunBilgisi.gun || 0}-${gunBilgisi.ay || 0}-${gunBilgisi.yil || 0}`;
                return (
                  <TouchableOpacity
                    key={gunKey}
                    onPress={() => setSeciliGun(gunBilgisi.gun)}
                    style={styles.gunTouchable}
                  >
                    <TakvimGunu
                      tarih={gunBilgisi.gun}
                      secili={seciliGun === gunBilgisi.gun}
                      bugun={
                        bugunTarihi === gunBilgisi.gun &&
                        new Date().getMonth() === gunBilgisi.ay &&
                        new Date().getFullYear() === gunBilgisi.yil &&
                        haftaOffset === 0 // Bugün işaretleyicisi sadece mevcut haftada görünmeli
                      }
                      gunAdi={gunBilgisi.gunAdi}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Kategori başlığı ve + butonu - Yan yana düzenlendi */}
        <View style={styles.kategorilerBaslikContainer}>
          <View style={styles.baslikEkleContainer}>
            <Text style={styles.kategorilerBaslik}>Kıyafetlerim</Text>
            <TouchableOpacity onPress={yeniKiyafetEkle} style={styles.ekleButon}>
              <View style={styles.ekleButonContainer}>
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color="#FFF"
                />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={tumunuGoster}>
            <Text style={styles.tumunuGorText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {/* Kategori Başlık ve İçerik Bölümü */}
        {seciliKategori ? (
          // Kategori detay görünümü
          <>
            <View style={styles.kategoriBaslikContainer}>
              <TouchableOpacity onPress={anaListeyeDon} style={styles.geriButon}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.textDark}
                />
              </TouchableOpacity>
              <Text style={styles.kategoriBaslikText}>{seciliKategori.baslik}</Text>
              <View style={styles.boslukSag}></View>
            </View>

            {/* Seçili kategorideki kıyafetlerin listesi */}
            <View style={styles.kiyafetListesiContainer}>
              {secilenKategoridekiKiyafetler.map(kiyafet => (
                <TouchableOpacity key={kiyafet.id} style={styles.kiyafetItem}>
                  <View style={styles.kiyafetIcKonteyner}>
                    <View style={styles.kiyafetIkonContainer}>
                      <Image
                        source={kiyafet.image}
                        style={styles.kiyafetResim}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.kiyafetMetinContainer}>
                      <Text style={styles.kiyafetIsim} numberOfLines={1} ellipsizeMode="tail">{kiyafet.isim}</Text>
                      <Text style={styles.kiyafetAltTur} numberOfLines={1}>{kiyafet.alt_tur}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : tumKiyafetleriGoster ? (
          // Tüm kıyafetleri gösteren görünüm
          <>
            <View style={styles.kategoriBaslikContainer}>
              <TouchableOpacity onPress={anaListeyeDon} style={styles.geriButon}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.textDark}
                />
              </TouchableOpacity>
              <Text style={styles.kategoriBaslikText}>Tüm Kıyafetlerim</Text>
              <View style={styles.boslukSag}></View>
            </View>

            {/* Tüm kıyafetlerin listesi */}
            <View style={styles.kiyafetListesiContainer}>
              {kullaniciKiyafetleri.map(kiyafet => (
                <TouchableOpacity key={kiyafet.id} style={styles.kiyafetItem}>
                  <View style={styles.kiyafetIcKonteyner}>
                    <View style={styles.kiyafetIkonContainer}>
                      <Image
                        source={kiyafet.image}
                        style={styles.kiyafetResim}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.kiyafetMetinContainer}>
                      <Text style={styles.kiyafetIsim} numberOfLines={1} ellipsizeMode="tail">{kiyafet.isim}</Text>
                      <Text style={styles.kiyafetAltTur} numberOfLines={1}>{kiyafet.alt_tur}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          // Ana kategori listesi görünümü
          <>
            {/* Kategoriler veya Boş Gardrop */}
            {aktifKategoriler.length > 0 ? (
              <View style={styles.kategorilerContainer}>
                {aktifKategoriler.map((kategori) => (
                  <KategoriKarti
                    key={`kategori-${kategori.id}`}
                    baslik={kategori.baslik}
                    ikonAdi={kategori.ikon}
                    kiyafetSayisi={kategori.kiyafetSayisi}
                    onPress={() => kategoriSec(kategori.id)}
                    image={kategori.image}
                  />
                ))}
              </View>
            ) : (
              <BosGardrop />
            )}
          </>
        )}
      </ScrollView>

      {/* Bilgilendirme Modal - Tam ekran yapıldı */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={bilgilendirmeModalVisible}
        onRequestClose={() => setBilgilendirmeModalVisible(false)}
      >
        <SafeAreaView style={styles.modalTamEkran}>
          <View style={styles.modalBaslikContainer}>
            <Text style={styles.modalBaslikText}>Bilgilendirme</Text>
            <TouchableOpacity 
              onPress={() => setBilgilendirmeModalVisible(false)}
              style={styles.modalKapatButon}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalIcerikContainer}>
            <Image
              source={{ uri: 'https://thumbs.dreamstime.com/b/blank-shirt-mock-up-template-front-back-view-plain-white-t-isolated-black-tee-design-mockup-presentation-print-280360860.jpg' }}
              style={styles.modalTamEkranImage}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>Lütfen kıyafetinizi resimdeki gibi arkalı önlü çekiniz.</Text>
            
            <View style={styles.modalBottomContainer}>
              <View style={styles.checkboxContainer}>
                <Switch
                  value={bilgilendirmeyiGosterme}
                  onValueChange={setBilgilendirmeyiGosterme}
                  trackColor={{ false: COLORS.textLight, true: COLORS.primaryDark }}
                  thumbColor={bilgilendirmeyiGosterme ? COLORS.primary : '#f4f3f4'}
                />
                <Text style={styles.checkboxText}>Bir daha gösterme</Text>
              </View>
              
              <TouchableOpacity
                style={styles.anladimButon}
                onPress={async () => {
                  setBilgilendirmeModalVisible(false);
                  try {
                    // Sadece kamera izni iste
                    const { status } = await Camera.requestCameraPermissionsAsync();
                    
                    if (status === 'granted') {
                      setKameraIzni(true);
                      setTimeout(() => {
                        setKameraAcik(true);
                      }, 300);
                    } else {
                      Alert.alert('Kamera İzni Gerekli', 'Kıyafet eklemek için kamera izni vermeniz gerekmektedir.');
                    }
                  } catch (error) {
                    console.log("Kamera izni hatası:", error);
                    Alert.alert('Hata', 'Kamera izni alınırken bir hata oluştu.');
                  }
                }}
              >
                <Text style={styles.anladimText}>Anladım</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Fotoğraf Onay Modalı - Tam ekran yapıldı */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={onayModalVisible}
        onRequestClose={() => setOnayModalVisible(false)}
      >
        <SafeAreaView style={styles.modalTamEkran}>
          <View style={styles.modalBaslikContainer}>
            <Text style={styles.modalBaslikText}>Fotoğrafı onaylıyor musunuz?</Text>
            <TouchableOpacity 
              onPress={() => setOnayModalVisible(false)}
              style={styles.modalKapatButon}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalIcerikContainer}>
            <Image 
              source={{ uri: aktifFotograf === 1 ? onFotograf : arkaFotograf }} 
              style={styles.modalTamEkranImage} 
              resizeMode="contain"
            />
            
            <View style={styles.onayButonlari}>
              <TouchableOpacity style={styles.yenidenCekButon} onPress={yenidenCek}>
                <Text style={styles.yenidenCekText}>Yeniden Çek</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.onayliyorumButon} onPress={fotografiOnayla}>
                <Text style={styles.onayliyorumText}>Onaylıyorum</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Başarı Modalı - Tam ekran yapıldı */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={basariModalVisible}
        onRequestClose={() => setBasariModalVisible(false)}
      >
        <SafeAreaView style={styles.modalTamEkran}>
          <View style={styles.modalBaslikContainer}>
            <Text style={styles.modalBaslikText}>Kıyafet Eklendi</Text>
            <TouchableOpacity 
              onPress={anaMenuyeDon}
              style={styles.modalKapatButon}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalIcerikContainer}>
            <Image 
              source={{ uri: onFotograf }} 
              style={styles.modalTamEkranImage} 
              resizeMode="contain"
            />
            
            <TouchableOpacity style={styles.anaMenuyeDonButon} onPress={anaMenuyeDon}>
              <Text style={styles.anaMenuyeDonText}>Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Kamera Ekranı - Tam ekran */}
      {kameraAcik && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={true}
          onRequestClose={() => setKameraAcik(false)}
        >
          <SafeAreaView style={[styles.modalTamEkran, {backgroundColor: '#000'}]}>
            <View style={styles.kameraHeader}>
              <TouchableOpacity 
                onPress={() => {
                  console.log("Kamera kapatılıyor...");
                  setKameraAcik(false);
                  setOnFotograf(null);
                  setArkaFotograf(null);
                  setAktifFotograf(1);
                }}
                style={styles.kameraKapatButon}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.kameraBaslik}>
                {aktifFotograf === 1 ? 'Ön Fotoğraf Çek' : 'Arka Fotoğraf Çek'}
              </Text>
            </View>
            
            <View style={styles.kameraContainer}>
              <Camera
                style={styles.kamera}
                type={CAMERA_TYPE}
                ref={cameraRef}
              >
                <View style={{flex: 1}}></View>
                <View style={styles.kameraAltContainer}>
                  <View style={styles.fotografKutuculari}>
                    <View style={[
                      styles.fotografKutucuk, 
                      aktifFotograf === 1 ? styles.aktifFotografKutucuk : null
                    ]}>
                      {onFotograf ? (
                        <Image source={{uri: onFotograf}} style={styles.miniaturFoto} />
                      ) : (
                        <Text style={styles.kutucukText}>Ön</Text>
                      )}
                    </View>
                    <View style={[
                      styles.fotografKutucuk, 
                      aktifFotograf === 2 ? styles.aktifFotografKutucuk : null
                    ]}>
                      {arkaFotograf ? (
                        <Image source={{uri: arkaFotograf}} style={styles.miniaturFoto} />
                      ) : (
                        <Text style={styles.kutucukText}>Arka</Text>
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.fotografCekButon} onPress={fotografCek}>
                    <View style={styles.fotografCekButonIc}></View>
                  </TouchableOpacity>
                </View>
              </Camera>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 20, // Padding değerini daha da azalttım (40 -> 20)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  greeting: {
    fontSize: 24,
    color: COLORS.textMedium,
    fontWeight: '400',
  },
  name: {
    fontSize: 24,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  takvimKartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  takvimKart: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  takvimBasliklar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
    position: 'relative',
  },
  takvimBaslik: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  navButtonLeft: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  navButtonRight: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  takvimSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  gunTouchable: {
    width: 42,
    alignItems: 'center',
  },
  gunWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  gunAdiText: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 2,
    fontWeight: '500',
  },
  gunContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  seciliGun: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  bugunGun: {
    borderWidth: 1,
    borderColor: COLORS.today,
  },
  bugunNoktasi: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.today,
  },
  gunText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  seciliGunText: {
    color: COLORS.cardBg,
    fontWeight: 'bold',
  },
  bugunGunText: {
    fontWeight: 'bold',
  },
  havaDurumuContainer: {
    marginTop: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kategorilerBaslikContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  baslikEkleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kategorilerBaslik: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: 10, // + butonu ile arasındaki boşluk
  },
  ekleButon: {
    marginLeft: 5,
  },
  ekleButonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tumunuGorText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  kategorilerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 60, // 80'den 60'a azalttım
    backgroundColor: COLORS.background,
  },
  kategoriKart: {
    width: '48%',
    height: 200,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    padding: 5,
  },
  kategoriIcKonteyner: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // Beyaz arka plan
    borderWidth: 2,
    borderColor: COLORS.cardColor, // Kenarlar kahverengi
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kategoriIkonContainer: {
    width: '70%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
  },
  kategoriMetinContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 8,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: COLORS.cardColor, // Tamamen kahverengi arka plan
  },
  kategoriBaslik: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // Beyaz metin
    textAlign: 'center',
    marginBottom: 2,
  },
  kiyafetSayisi: {
    fontSize: 13,
    color: '#FFFFFF', // Beyaz metin
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.6, // Daha koyu olması için opaklığı 0.7'den 0.6'ya düşürdüm
  },
  bosGardropContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: COLORS.cardBg,
    padding: 24,
    borderRadius: 16,
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bosGardropBaslik: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 16,
  },
  bosGardropMesaj: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  kiyafetEkleButon: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  kiyafetEkleButonText: {
    color: COLORS.cardBg,
    fontSize: 16,
    fontWeight: '600',
  },
  kategoriBaslikContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    position: 'relative',
    height: 50,
  },
  kategoriBaslikText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  geriButon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  boslukSag: {
    width: 40,  // Sağda dengelemek için geri butonuyla aynı genişlikte boşluk
  },
  kiyafetListesiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 80,
    backgroundColor: COLORS.background,
  },
  kiyafetItem: {
    width: '48%',
    height: 160,
    marginVertical: 8,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    padding: 5,
  },
  kiyafetIcKonteyner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    backgroundColor: '#FFFFFF', // Beyaz arka plan
    borderWidth: 4,
    borderColor: COLORS.cardColor, // Kenarlar kahverengi
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kiyafetIkonContainer: {
    width: '70%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
  },
  kiyafetMetinContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 5,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: COLORS.cardColor, // Tamamen kahverengi arka plan
  },
  kiyafetIsim: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF', // Beyaz metin
    textAlign: 'center',
    marginBottom: 1,
  },
  kiyafetAltTur: {
    fontSize: 11,
    color: '#FFFFFF', // Beyaz metin
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.6, // Daha koyu olması için opaklığı 0.7'den 0.6'ya düşürdüm
  },
  kategoriResim: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  kiyafetResim: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  modalTamEkran: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalBaslikContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    backgroundColor: COLORS.cardBg,
    position: 'relative',
  },
  modalBaslikText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalKapatButon: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  modalIcerikContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  modalTamEkranImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  anladimButon: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  anladimText: {
    color: '#fff',
    fontWeight: '500',
  },
  onayButonlari: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  yenidenCekButon: {
    backgroundColor: COLORS.textLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  onayliyorumButon: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  yenidenCekText: {
    color: COLORS.textDark,
    fontWeight: '500',
  },
  onayliyorumText: {
    color: '#fff',
    fontWeight: '500',
  },
  anaMenuyeDonButon: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  anaMenuyeDonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Kamera stilleri
  kameraContainer: {
    flex: 1,
  },
  kamera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  kameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  kameraKapatButon: {
    padding: 5,
  },
  kameraBaslik: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
  },
  kameraAltContainer: {
    padding: 20,
    alignItems: 'center',
  },
  fotografKutuculari: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  fotografKutucuk: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fotografCekButon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotografCekButonIc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  aktifFotografKutucuk: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  kutucukText: {
    color: '#fff',
    fontSize: 12,
  },
  miniaturFoto: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  sahteKamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
  },
  sahteKameraText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  sahteKameraAciklama: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
  },
}); 