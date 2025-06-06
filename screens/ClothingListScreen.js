import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {LayoutAnimation, UIManager, Platform} from 'react-native';
import {colors, typography, button, spacing} from '../theme/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export default function ClothingListScreen({navigation}) {
  const [clothes, setClothes] = useState([]);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('clothes'); // 'clothes' | 'outfits'
  const [outfits, setOutfits] = useState([]);
  const [modalPics, setModalPics] = useState([]); // ← inicializiramo kot prazen array

  const scrollRef = useRef();

  // Helper, da iz outfit dokumenta pridobimo array URL-jev
  const outfitImages = o =>
    (o.items?.map(it => it.imageUrl).filter(Boolean) ?? []).concat(
      [o.top, o.bottom, o.shoes, o.jacket, o.dress, o.accessories]
        .filter(Boolean)
        .map(p => p.imageUrl),
    );

  // Branje outfitov (ko je view==='outfits')
  useEffect(() => {
    if (view !== 'outfits') return;
    const uid = auth().currentUser?.uid;
    if (!uid) return;
    const unsub = firestore()
      .collection('outfits')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const items = snap?.docs?.map(d => ({id: d.id, ...d.data()})) ?? [];
          setOutfits(items);
        },
        err => {
          console.error('[outfits] listener:', err.message);
          setOutfits([]);
        },
      );
    return () => unsub();
  }, [view]);

  // Branje oblačil (ko je view==='clothes')
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    const unsubscribe = firestore()
      .collection('clothes')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          if (!snapshot?.docs) {
            setClothes([]);
            setFilteredClothes([]);
            return;
          }
          const items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          setClothes(items);
          setFilteredClothes(items);
        },
        error => {
          console.error('Firestore onSnapshot error:', error);
          setClothes([]);
          setFilteredClothes([]);
        },
      );
    return () => unsubscribe();
  }, []);

  // Filtriranje po kategoriji / iskanju
  useEffect(() => {
    let filtered = clothes;
    if (category) {
      filtered = filtered.filter(
        item => item.category?.toLowerCase() === category.toLowerCase(),
      );
    }
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    setFilteredClothes(filtered);
  }, [category, search, clothes]);

  const toggleFavorite = async (itemId, currentValue) => {
    try {
      await firestore().collection('clothes').doc(itemId).update({
        isFavorite: !currentValue,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  const toggleFavoriteOutfit = async (itemId, currentValue) => {
    try {
      await firestore().collection('outfits').doc(itemId).update({
        isFavorite: !currentValue,
      });
    } catch (err) {
      console.error('Error toggling favorite (outfit):', err);
    }
  };

  const renderClothes = ({item}) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{flex: 1}}
        activeOpacity={0.8}
        onPress={() => {
          console.log('Kliknil sem na sliko, URL =', item.imageUrl);
          setModalPics([item.imageUrl]); // nastavimo array z enim URL
        }}
      >
        <Image source={{uri: item.imageUrl}} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => toggleFavorite(item.id, item.isFavorite)}
      >
        <AntDesign
          name={item.isFavorite ? 'heart' : 'hearto'}
          size={24}
          color={item.isFavorite ? colors.moderateRed : colors.grey}
        />
      </TouchableOpacity>
    </View>
  );

  const renderOutfit = ({item}) => {
    const imgs = outfitImages(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Kliknil sem na outfit, URLs =', imgs);
          setModalPics(imgs); // nastavimo array z do 6 URL-ji
        }}
      >
        <View style={styles.collageBox}>
          {imgs.slice(0, 4).map((uri, i) => (
            <Image
              key={i}
              source={{uri}}
              style={[styles.collageImg, styles[`pos${i}`]]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavoriteOutfit(item.id, item.isFavorite)}
        >
          <AntDesign
            name={item.isFavorite ? 'heart' : 'hearto'}
            size={24}
            color={item.isFavorite ? colors.moderateRed : colors.grey}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const categories = [
    'Tops',
    'Shirts',
    'Cardigans',
    'Blazers',
    'Jackets',
    'Trousers',
    'Jeans',
    'Shorts',
    'Skirts',
    'Dresses',
    'Shoes',
    'Trainers',
    'Boots',
    'Flats',
    'Heels',
    'Sandals',
    'Accessories',
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.heading}>Find Your Perfect Look</Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, view === 'clothes' && styles.switchSel]}
          onPress={() => setView('clothes')}
        >
          <Text style={view === 'clothes' ? styles.switchTxtSel : styles.switchTxt}>
            Clothes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, view === 'outfits' && styles.switchSel]}
          onPress={() => setView('outfits')}
        >
          <Text style={view === 'outfits' ? styles.switchTxtSel : styles.switchTxt}>
            Outfits
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'clothes' && (
        <>
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.grey}
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            horizontal
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat.toLowerCase() && styles.selected,
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setCategory(prev => (prev === cat.toLowerCase() ? '' : cat.toLowerCase()));
                  scrollRef.current?.scrollTo({x: index * 90, animated: true});
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.toLowerCase() && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <FlatList
        data={view === 'clothes' ? filteredClothes : outfits}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={view === 'clothes' ? renderClothes : renderOutfit}
        contentContainerStyle={{paddingBottom: '100%'}}
        ListEmptyComponent={() =>
          view === 'outfits' ? (
            <View style={{alignItems: 'center', marginTop: 40}}>
              <Text style={{color: colors.grey}}>No outfits found</Text>
            </View>
          ) : (
            <View style={{alignItems: 'center', marginTop: 40}}>
              <Text style={{color: colors.grey}}>No clothes found</Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddClothing')}
      >
        <Text style={styles.buttonText}>Add new clothing</Text>
      </TouchableOpacity>

      {/* ─── Modal ─── prikaz fullscreen slik ─── */}
      {modalPics.length > 0 && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalPics([])}
        >
          <View style={styles.modalWrap}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalPics([])}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>

            <FlatList
              data={modalPics}
              horizontal
              pagingEnabled
              keyExtractor={(uri, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.fullImgWrap}>
                  <Image
                    source={{ uri: item }}
                    style={styles.fullImg}
                    onError={e => console.error('Napaka pri nalaganju slike:', e.nativeEvent.error)}
                  />
                </View>
              )}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    padding: 16,
  },
  heading: {
    ...typography.heading1,
    color: colors.moderateRed,
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.darkGray1,
    color: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.m,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.gray31,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    paddingHorizontal: 14,
    height: 32,
  },
  categoryText: {
    color: colors.grey,
    fontSize: 14,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.white,
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 44,
    marginBottom: spacing.l,
  },
  selected: {
    backgroundColor: colors.moderateRed,
    borderColor: colors.moderateRed,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.darkGray1,
    borderRadius: 10,
    marginBottom: spacing.s,
    marginRight: '4%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.moderateRed,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    top: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: spacing.m,
    margin: spacing.s,
  },
  switchBtn: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.gray31,
    borderRadius: 20,
    marginRight: 8,
    width: '50%',
  },
  switchSel: {
    backgroundColor: colors.moderateRed,
    borderColor: colors.moderateRed,
  },
  switchTxt: {
    color: colors.grey,
    textAlign: 'center',
  },
  switchTxtSel: {
    color: colors.white,
    textAlign: 'center',
  },
  /* KOLÁŽ */
  collageBox: {
    width: '100%',
    height: '100%',
    position: 'relative', // nujno, da absolutne slike pravilno zapolnijo kvadrat
    flexWrap: 'wrap',
  },
  collageImg: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    resizeMode: 'cover',
  },
  pos0: {left: 0, top: 0},
  pos1: {right: 0, top: 0},
  pos2: {left: 0, bottom: 0},
  pos3: {right: 0, bottom: 0},

  /* MODAL */
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: colors.gray31,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: colors.grey,
    borderWidth: 1,
    zIndex: 10,
  },
  modalCloseTxt: {
    color: colors.white,
    fontSize: 16,
  },
  fullImgWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImg: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
});
