import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {colors, typography, button, spacing} from '../theme/theme';
import {fetchWeatherInfo} from '../utils/weather';
import Icon from 'react-native-vector-icons/Feather';
import Geolocation from 'react-native-geolocation-service';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {PermissionsAndroid, Platform} from 'react-native';
const {width, height} = Dimensions.get('window');
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const getWeatherIconName = tag => {
  const base = tag?.split('-')[0];
  if (tag.includes('rain')) return 'weather-pouring';
  if (tag.includes('sunny')) return 'weather-sunny';
  if (tag.includes('snow')) return 'weather-snowy-heavy';
  if (tag.includes('cloud')) return 'weather-cloudy';
  return 'weather-partly-cloudy';
};

export default function HomeScreen({navigation}) {
  const [clothesByCategory, setClothesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [showWeatherInfo, setShowWeatherInfo] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState('');
  let intervalId = null;
  const currentUser = auth().currentUser;

  useEffect(() => {
    async function loadUserProfile() {
      if (!currentUser) {
        setUserName('User');
        setLoadingUser(false);
        return;
      }
      try {
        const doc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (doc.exists) {
          const data = doc.data();
          setUserName(data.fullName || data.username || currentUser.email);
        } else {
          // Če dokument ne obstaja, privzeti naslov
          setUserName('trendsetter');
        }
      } catch (e) {
        console.error('Napaka pri branju uporabniškega profila:', e);
        setUserName(currentUser.email);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUserProfile();
  }, [currentUser]);

  useEffect(() => {
    const all = Object.entries(clothesByCategory);
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    setSelectedCategories(shuffled.slice(0, 2));
  }, [clothesByCategory]);

  // Funkcija, ki pridobi lokacijo in nato vreme
  const getLocationAndWeather = async () => {
    // Če že nismo "loading=false", pustimo loading dokler ne dobimo first call-a
    if (loading) setLoading(true);

    try {
      // 1) Na Androidu zahtevamo dovoljenje
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Dovoljenje za lokacijo',
            message:
              'Aplikacija potrebuje dostop do vaše lokacije, da pridobi vreme.',
            buttonNeutral: 'Kasneje',
            buttonNegative: 'Zavrni',
            buttonPositive: 'Dovoli',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Dovoljenje zavrnjeno',
            'Brez lokacije ne moremo pridobiti vremenskih podatkov.',
          );
          setLoading(false);
          return;
        }
      }

      // 2) Pridobimo trenutno pozicijo
      Geolocation.getCurrentPosition(
        async pos => {
          try {
            const {latitude, longitude} = pos.coords;
            // Pokličemo svojo helper funkcijo za vreme
            const info = await fetchWeatherInfo(latitude, longitude);
            if (info) {
              setWeather(info);
            }
          } catch (e) {
            console.warn('Napaka pri fetchWeatherInfo:', e);
          } finally {
            setLoading(false);
          }
        },
        err => {
          console.error('Napaka pri Geolocation.getCurrentPosition:', err);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (e) {
      console.warn('Permission/location fetch failed:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1) Ob mountu enkrat pokličemo
    getLocationAndWeather();

    // 2) Nastavimo interval, da se funkcija pokliče vsake 10 minut
    intervalId = setInterval(() => {
      getLocationAndWeather();
    }, 600000); // 600000 ms = 10 minut

    // 3) Ob unmountu počistimo interval
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // prazen array pomeni: ob prvi render in kasneje le čiščenje

  useEffect(() => {
    const fetchClothes = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      try {
        const snapshot = await firestore()
          .collection('clothes')
          .where('userId', '==', uid)
          .get();

        const categorized = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!categorized[data.category]) categorized[data.category] = [];
          categorized[data.category].push({id: doc.id, ...data});
        });

        setClothesByCategory(categorized);
      } catch (error) {
        console.error('Error fetching clothes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClothes();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.moderateRed} />
      </View>
    );
  }
  // const tips = [
  //   'Add contrast with bold shoes.',
  //   'Layering adds depth to any outfit.',
  //   'Mix casual with elegant today.',
  // ];
  // const tip = tips[Math.floor(Math.random() * tips.length)];

  const renderCategorySection = (category, items) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.carouselCard}>
            <Image source={{uri: item.imageUrl}} style={styles.carouselImage} />
            <Text style={styles.carouselLabel}>{item.name || 'My Look'}</Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>
          Hello, {loadingUser ? 'Loading...' : userName}!
        </Text>
        {weather && (
          <TouchableOpacity onPress={() => setShowWeatherInfo(prev => !prev)}>
            <MaterialCommunityIcons
              name={getWeatherIconName(weather.tag)}
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        )}
      </View>
      {showWeatherInfo && (
        <View style={styles.weatherPopup}>
          <Text style={styles.weatherPopupText}>{weather.temp}°C</Text>
          <Text style={styles.weatherPopupText}>{weather.tag}</Text>
        </View>
      )}
      <View style={styles.weatherText}>
        {/* <Text style={styles.date}>{tip}</Text> */}
        <Text style={styles.description}>
          What should I wear to look my best?
        </Text>
        <Text style={styles.description1}>
          No more doubts about combinations:Browse your closet, get inspired,
          and create looks that make every day a fashion statement.
        </Text>
        <TouchableOpacity
          style={styles.actionButton1}
          onPress={() => navigation.navigate('OutfitGenerator')}>
            
          <View style={{flexDirection: 'row', alignItems: 'center'}}>

            <Text style={styles.buttonText1}>Create Your Own Look </Text>
          <Fontisto
              name="arrow-right-l"
              size={20}
              color={colors.darkGray1}
              style={{marginRight: spacing.s}}
            />
            </View>
        </TouchableOpacity>
        <View style={styles.downloadWrapper}>
          <Image
            source={require('../assets/images/home2.png')}
            style={styles.downloadImage}
          />
        </View>
      </View>

      {selectedCategories.map(([category, items]) =>
        renderCategorySection(category, items),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    paddingTop: '10%',
  },
  loaderContainer: {
    marginTop: '50%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  greeting: {
    ...typography.heading1,
    fontStyle: 'italic',
    color: colors.white,
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  weatherText: {
    color: colors.white,
    fontStyle: 'italic',
    marginBottom: spacing.s,
    // backgroundColor: '#EDBFC8',
    backgroundColor: '#C7B7A9',
    padding: spacing.s,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    marginTop: spacing.m,
  },
  date: {
    ...typography.body,
    color: colors.white,
    marginBottom: spacing.l,
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: spacing.l,
  },
  actionButton: {
    marginTop: spacing.s,
    backgroundColor: colors.moderateRed,
    padding: spacing.xs,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: '20%',
  },
  buttonText: {
    ...button.primary,
    color: colors.white,
  },

  categorySection: {
    marginBottom: spacing.s,
    marginHorizontal: spacing.m,
    marginBottom: '10%',
  },
  categoryTitle: {
    ...typography.heading3,
    color: colors.white,
  },
  carouselContainer: {
    paddingVertical: spacing.s,
  },
  carouselCard: {
    backgroundColor: colors.gray31,
    padding: spacing.s,
    borderRadius: 16,
    marginRight: spacing.m,
    alignItems: 'center',
    width: width * 0.5,
  },
  carouselImage: {
    width: '100%',
    height: height * 0.25,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  carouselLabel: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  weatherPopup: {
    position: 'absolute',
    top: 45,
    height: '7%',
    right: 0,
    backgroundColor: colors.gray31,
    borderColor: colors.grey,
    border: 2,
    borderWidth: 1,
    padding: spacing.s,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    padding: 15,
    width: width * 0.3,
    
  },
  weatherPopupText: {
    color: colors.white,
    textAlign: 'center',
    ...typography.body,
  },
  description: {
    ...typography.heading3,
    color: colors.darkGray,
    marginBottom: spacing.s,
  },
  description1: {
    ...typography.paragraph2,
    color: colors.darkGray,
    lineHeight: 20,
  },
  actionButton1: {
    paddingTop: spacing.s,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  buttonText1: {
    fontWeight: 'bold',
    color: colors.darkGray1,
  },
  downloadWrapper: {
    alignItems: 'center',
  },
   downloadImage: {
    width: width * 0.9,     // 60% of screen width
    height: (width * 0.9) * 1,  // keep a 5:3 ratio (adjust as you like)
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: spacing.s,
    zIndex: 1,
  },
});
