// screens/FavoritesScreen.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../theme/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FavoritesScreen({ navigation }) {
  // ——— STATE ———
  const [view, setView] = useState('clothes');          // 'clothes' or 'outfits'
  const [favoriteClothes, setFavoriteClothes] = useState([]); // MUST be array
  const [favoriteOutfits, setFavoriteOutfits] = useState([]); // MUST be array
  const [modalImgs, setModalImgs] = useState(null);     // array of URIs for full-screen preview

  const userId = auth().currentUser?.uid || '';
  const scrollRef = useRef(null);

  /**
   * HELPER: Given an outfit document `o`, return an array of image URLs.
   *   - If `o.items` is a true array of objects with `imageUrl`, extract those.
   *   - Otherwise (older structure), pick top/bottom/shoes/jacket/dress/accessories.
   */
  function outfitImages(o) {
    // 1) If `items` is truly an array of objects:
    if (Array.isArray(o.items)) {
      const urls = o.items
        .filter(it => it && typeof it.imageUrl === 'string')
        .map(it => it.imageUrl);
      if (urls.length > 0) {
        return urls;
      }
    }

    // 2) If Firestore returned `items` as an object with numeric keys:
    if (o.items && typeof o.items === 'object') {
      const asMap = Object.values(o.items);
      const urlsFromMap = asMap
        .filter(it => it && typeof it.imageUrl === 'string')
        .map(it => it.imageUrl);
      if (urlsFromMap.length > 0) {
        return urlsFromMap;
      }
    }

    // 3) Fallback to older top/bottom/jacket/etc. fields:
    return [
      o.top?.imageUrl,
      o.bottom?.imageUrl,
      o.shoes?.imageUrl,
      o.jacket?.imageUrl,
      o.dress?.imageUrl,
      o.accessories?.imageUrl,
    ].filter(u => typeof u === 'string');
  }

  // ——— FIRESTORE LISTENERS ———

  // Listen to favorite clothes, only when view === 'clothes'
  useEffect(() => {
    if (view !== 'clothes' || !userId) {
      setFavoriteClothes([]);
      return;
    }
    const unsub = firestore()
      .collection('clothes')
      .where('userId', '==', userId)
      .where('isFavorite', '==', true)
      .onSnapshot(
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setFavoriteClothes(items);
        },
        err => {
          console.error('Favorite clothes listener error:', err);
          setFavoriteClothes([]);
        }
      );
    return () => unsub();
  }, [view, userId]);

  // Listen to favorite outfits, only when view === 'outfits'
  useEffect(() => {
    if (view !== 'outfits' || !userId) {
      setFavoriteOutfits([]);
      return;
    }
    const unsub = firestore()
      .collection('outfits')
      .where('userId', '==', userId)
      .where('isFavorite', '==', true)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setFavoriteOutfits(items);
        },
        err => {
          console.error('Favorite outfits listener error:', err);
          setFavoriteOutfits([]);
        }
      );
    return () => unsub();
  }, [view, userId]);

  // ——— TOGGLE FAVORITE FUNCTIONS ———

  // Remove a clothing item from favorites
  async function toggleFavoriteCloth(itemId) {
    try {
      await firestore().collection('clothes').doc(itemId).update({
        isFavorite: false,
      });
    } catch {
      // ignore errors
    }
  }

  // Remove an outfit from favorites
  async function toggleFavoriteOutfit(itemId) {
    try {
      await firestore().collection('outfits').doc(itemId).update({
        isFavorite: false,
      });
    } catch {
      // ignore errors
    }
  }

  // ——— RENDERERS ———

  // Renders one favorite clothing card.
  // NOTE: We must destructure { item } here so that `item` is the data object.
  function renderClothItem({ item }) {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalImgs([item.imageUrl])}
          style={{ flex: 1 }}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleFavoriteCloth(item.id)}
        >
          <AntDesign name="heart" size={24} color={colors.moderateRed} />
        </TouchableOpacity>
      </View>
    );
  }

  // Renders one favorite outfit card (2×2 collage of up to 4 images)
  function renderOutfitItem({ item }) {
    const imgs = outfitImages(item);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setModalImgs(imgs)}
      >
        <View style={styles.collageBox}>
          {imgs.slice(0, 4).map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={[styles.collageImg, styles['pos' + idx]]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleFavoriteOutfit(item.id)}
        >
          <AntDesign
            name={item.isFavorite ? 'heart' : 'hearto'}
            size={24}
            color={item.isFavorite ? colors.moderateRed : colors.grey}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ——— MAIN JSX ———
  return (
    <View style={styles.container}>
      {/* “Back” button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.heading}>Favourites</Text>
      <Text style={styles.subheading}>
        Your saved styles, all in one place.
      </Text>

      {/* Tab switcher: Clothes vs Outfits */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, view === 'clothes' && styles.switchSel]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setView('clothes');
          }}
        >
          <Text
            style={view === 'clothes' ? styles.switchTxtSel : styles.switchTxt}
          >
            Clothes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, view === 'outfits' && styles.switchSel]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setView('outfits');
          }}
        >
          <Text
            style={view === 'outfits' ? styles.switchTxtSel : styles.switchTxt}
          >
            Outfits
          </Text>
        </TouchableOpacity>
      </View>

      {/* Depending on current tab, show favoriteClothes or favoriteOutfits */}
      {view === 'clothes' ? (
        <FlatList
          data={favoriteClothes}
          renderItem={renderClothItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>No favorite clothes</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={favoriteOutfits}
          renderItem={renderOutfitItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>No favorite outfits</Text>
            </View>
          )}
        />
      )}

      {/* Preview Modal (full‐screen, swipeable) */}
      {modalImgs !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalImgs(null)}
        >
          <View style={styles.modalWrap}>
            <FlatList
              data={modalImgs}
              horizontal
              pagingEnabled
              keyExtractor={(uri, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.fullImgWrap}
                  activeOpacity={1}
                  onPress={() => setModalImgs(null)}
                >
                  <Image source={{ uri: item }} style={styles.fullImg} />
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

// ——— STYLES ———

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    marginTop:spacing.m
  },
  heading: {
    ...typography.heading1,
    color: colors.moderateRed,
    fontStyle: 'italic',
    marginBottom: spacing.s,
  },
  subheading: {
    ...typography.heading3,
    fontStyle: 'italic',
    color: colors.white,
    marginBottom: spacing.m,
  },
  switchRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray31,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  switchSel: {
    backgroundColor: colors.moderateRed,
    borderColor: colors.moderateRed,
  },
  switchTxt: {
    color: colors.grey,
  },
  switchTxtSel: {
    color: colors.white,
  },
  list: {
    paddingBottom: '100%',
  },
  emptyTextContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.grey,
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
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  /* COLLAGE layout for outfits */
  collageBox: {
    width: '100%',
    height: '100%',
    position: 'relative', // parent must be relative so the absolute children crop correctly
    flexWrap: 'wrap',
  },
  collageImg: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    resizeMode: 'cover',
  },
  pos0: { left: 0, top: 0 },
  pos1: { right: 0, top: 0 },
  pos2: { left: 0, bottom: 0 },
  pos3: { right: 0, bottom: 0 },
  /* Fullscreen modal */
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImgWrap: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImg: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
});
