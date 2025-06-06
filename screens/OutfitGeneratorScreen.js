// screens/OutfitGeneratorScreen.js
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {colors, spacing, typography} from '../theme/theme';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const {width: SCREEN_WIDTH} = Dimensions.get('window');


export default function OutfitGeneratorScreen({route}) {
  const [outfits, setOutfits] = useState([]);
  const [allClothes, setAllClothes] = useState([]);
  const [weatherTag, setWeatherTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [showHint, setShowHint] = useState(true); // swipe namig

  const scrollRef = useRef();
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const {updatedOutfit, refresh} = route.params ?? {};

      if (updatedOutfit) {
        setOutfits(prev => {
          const list = [...prev];
          list[list.length - 1] = updatedOutfit;
          return list;
        });

        /*  počisti, da naslednjič spet zazna  */
        navigation.setParams({updatedOutfit: null, refresh: null});
      }
    }, [route.params?.refresh]),
  );

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location to fetch weather info.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({lat: latitude, lon: longitude});
        },
        error => {
          console.error('Location error:', error);
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const userLoc = await getCurrentLocation();
        if (!userLoc) {
          setWeatherTag('warm');
          return;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${userLoc.lat}&lon=${userLoc.lon}&appid=${WEATHER_KEY}&units=metric`;
        const r = await fetch(url);
        const js = await r.json();
        const temp = js.main?.temp ?? 20;
        const cond = (js.weather?.[0]?.main || '').toLowerCase();
        let tag = temp < 10 ? 'cold' : temp < 20 ? 'chilly' : 'warm';
        if (cond.includes('rain')) tag += '-rainy';
        if (cond.includes('clear')) tag += '-sunny';
        setWeatherTag(tag);
      } catch (e) {
        console.warn('Weather fetch failed ► fallback warm', e);
        setWeatherTag('warm');
      }
    })();
  }, []);

  const fetchUserClothes = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return [];

    const snap = await firestore()
      .collection('clothes')
      .where('userId', '==', uid)
      .get();

    return snap.docs
      .map(d => ({id: d.id, ...d.data()}))
      .filter(
        c => typeof c.imageUrl === 'string' && c.imageUrl.startsWith('http'),
      );
  };

  const askOpenAI = async clothes => {
    const list = clothes
      .map(c => `- ${c.name} (${c.color || 'unknown'}, ${c.category})`)
      .join('\n');
    const prompt = `You are a fashion assistant.
Category rules:
•  Tops = categories Shirts, Tops, Blouses, T-Shirts, Sweaters
•  Bottoms = categories Pants, Jeans, Skirts
•  Dresses = category Dresses (can be used alone as a full outfit)
•  Jackets = category Jackets (can be paired optionally with Tops)
•  Shoes = categories Shoes, Boots, Sneakers, Heels
•  Accessories = category Accessories (e.g. bags, scarves — optional)

Given these items:
${list}

Weather: ${weatherTag}
Hint: Make a different stylish choice each time, no repeats!
Pick one of the following outfit types:
A) A Dress with Shoes (+ optional Jacket or Accessories)  
B) A Top and Bottom with Shoes (+ optional Jacket or Accessories)

Pick exactly ONE Top, ONE Bottom, and ONE pair of Shoes from the list. OPTIONALLY: a jacket and one accessory.
Respond STRICTLY in this format:

Top: <name or "none">
Bottom: <name or "none">
Dress: <name or "none">
Jacket: <name or "none">
Shoes: <name>
Accessories: <name or "none">

Make sure to describe them using the correct colors given!
Description: <one elegant sentence>
Seed: ${Date.now()}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 1.2,
        messages: [{role: 'user', content: prompt}],
      }),
    });

    const js = await res.json();
    return js.choices?.[0]?.message?.content || '';
  };

  const findBestMatch = (name, clothes) => {
    if (!name) return null;
    const n = name.toLowerCase();
    return clothes.find(
      c => c.name.toLowerCase().includes(n) || n.includes(c.name.toLowerCase()),
    );
  };

  const parseReply = (reply, clothes) => {
    const grab = label =>
      reply
        .match(new RegExp(`${label}:\\s*(.+)`, 'i'))?.[1]
        ?.trim()
        .toLowerCase();
    const desc = reply.match(/Description:\s*([\s\S]*)/i)?.[1]?.trim() || '';

    return {
      top: findBestMatch(grab('Top'), clothes),
      bottom: findBestMatch(grab('Bottom'), clothes),
      shoes: findBestMatch(grab('Shoes'), clothes),
      dress: findBestMatch(grab('Dress'), clothes),
      jacket: findBestMatch(grab('Jacket'), clothes),
      accessories: findBestMatch(grab('Accessories'), clothes),
      description: desc,
    };
  };

  const generateOutfit = async () => {
    setLoading(true);
    try {
      const clothes = await fetchUserClothes();
      setAllClothes(clothes);
      if (!clothes.length) {
        console.warn('No clothes saved yet');
        return;
      }
      const reply = await askOpenAI(clothes);
      const outfit = parseReply(reply, clothes);
      setOutfits(prev => [...prev, outfit]);
    } catch (e) {
      console.error('AI outfit generation failed:', e);
    }
    setLoading(false);
  };

  const saveWholeOutfit = async idx => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      const o = outfits[idx]; // outfit na ekranu
      const items = [
        o.top,
        o.bottom,
        o.shoes,
        o.dress,
        o.jacket,
        o.accessories,
      ].filter(Boolean); // odstrani null-e

      await firestore().collection('outfits').add({
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        description: o.description,
        items, // polje objektov
        isFavorite: false,
      });

      // po želji: kratko obvestilo
      console.log('✅ Outfit saved');
    } catch (e) {
      console.warn('Save failed', e);
    }
  };

  const onScrollEnd = e => {
    const {contentOffset, layoutMeasurement} = e.nativeEvent;
    const currentIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    if (currentIndex === outfits.length - 1) generateOutfit();
    if (showHint) setShowHint(false);
  };

  useEffect(() => {
    if (weatherTag && outfits.length === 0) generateOutfit();
  }, [weatherTag]);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      ref={scrollRef}
      onMomentumScrollEnd={onScrollEnd}
      contentContainerStyle={styles.scrollContainer}
      showsHorizontalScrollIndicator={false}>
      
      {outfits.map((outfit, idx) => (
        <View key={idx} style={styles.page}>
          
          <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
            <View style={styles.thumbGrid}>
              {[
                // put every non-null piece in a flat array so map() is easy
                outfit.top,
                outfit.bottom,
                outfit.shoes,
                outfit.dress,
                outfit.jacket,
                outfit.accessories,
              ]
                .filter(Boolean)
                .map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.thumbCard}
                    onPress={() => setPreviewUri(item.imageUrl)}>
                    <Image
                      source={{uri: item.imageUrl}}
                      style={styles.thumbImage}
                    />
                    <Text numberOfLines={1} style={styles.thumbLabel}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            <View style={styles.swipeHint}>
              <MaterialIcons name="swipe-left" size={24} color={colors.grey} />
              <Text style={styles.swipeTxt}>swipe for next look</Text>
            </View>

            <Text style={styles.desc}>{outfit.description}</Text>
            <TouchableOpacity
              style={styles.details}
              onPress={() =>
                navigation.navigate('OutfitDetails', {
                  outfit,
                  clothes: allClothes,
                  // ↙︎ callback, ki zamenja točno ta outfit
                  onSave: updated =>
                    setOutfits(prev => {
                      const list = [...prev];
                      list[idx] = updated; // idx že imaš v map-u
                      return list;
                    }),
                })
              }>
              <Text style={{color: colors.white, fontWeight: 'bold'}}>
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.details,
                {backgroundColor: colors.highland, marginTop: 10},
              ]}
              onPress={() => saveWholeOutfit(idx)}>
              <Text style={{color: colors.white, fontWeight: 'bold'}}>
                Save outfit
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ))}
      {loading && (
        <View style={styles.page}>
          <ActivityIndicator size="large" color={colors.moderateRed} />
        </View>
      )}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}>
        <TouchableOpacity
          style={styles.modalWrap}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}>
          <Image source={{uri: previewUri}} style={styles.modalImage} />
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    backgroundColor: colors.darkGray,
  },
  container: {
    padding: spacing.l,
    alignItems: 'center',
    paddingTop: '20%'
  },
  outfitContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  outfitImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: spacing.s,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  desc: {
    ...typography.paragraph2,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  details: {
    backgroundColor: colors.moderateRed,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  thumbGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  thumbCard: {
    width: '48%', // 2 stolpca
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: spacing.s,
    alignItems: 'center',
    paddingVertical: 8,
  },
  thumbImage: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  thumbLabel: {
    ...typography.paragraph3,
    color: colors.grey,
    marginTop: 4,
    maxWidth: '90%',
    textAlign: 'center',
  },
  modalWrap: {
    flex: 1,
    backgroundColor: '#000C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.s,
    opacity: 0.6,
    marginBottom: spacing.m,
  },
  swipeTxt: {
    ...typography.paragraph3,
    color: colors.grey,
    marginLeft: 4,
  },
 backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? spacing.l * 1.5 : spacing.l,
    left: spacing.l,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});