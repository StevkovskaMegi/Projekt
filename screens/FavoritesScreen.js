import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, typography, spacing} from '../theme/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FavoritesScreen({navigation}) {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavs, setFilteredFavs] = useState([]);
  const [catFilter, setCatFilter] = useState('');
  const scrollRef = useRef();

  const userId = auth().currentUser?.uid;
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

  /* 🔄 listen to fav changes */
  useEffect(() => {
    const unsub = firestore()
      .collection('clothes')
      .where('userId', '==', userId)
      .where('isFavorite', '==', true)
      .onSnapshot(snap => {
        const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setFavorites(items);
      });
    return unsub;
  }, []);

  /* re‑filter when list or filter changes */
  useEffect(() => {
    if (!catFilter) {
      setFilteredFavs(favorites);
      return;
    }
    setFilteredFavs(
      favorites.filter(f => f.category?.toLowerCase() === catFilter),
    );
  }, [favorites, catFilter]);

  const toggleFavorite = async itemId => {
    try {
      await firestore()
        .collection('clothes')
        .doc(itemId)
        .update({isFavorite: false});
    } catch {
      Alert.alert('Error', 'Could not update favorite status');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.imageUrl}} style={styles.image} />
      <TouchableOpacity
        style={styles.heartIcon}
        onPress={() => toggleFavorite(item.id)}>
        <AntDesign name="heart" size={24} color={colors.moderateRed} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.heading}>Favourites</Text>
      <Text style={styles.subheading}>
        Your saved styles, all in one place.
      </Text>

      {/* Category ribbon */}
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}>
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catBtn,
              catFilter === cat.toLowerCase() && styles.catSel,
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setCatFilter(prev =>
                prev === cat.toLowerCase() ? '' : cat.toLowerCase(),
              );
              scrollRef.current?.scrollTo({x: i * 90, animated: true});
            }}>
            <Text
              numberOfLines={1}
              style={[
                styles.catTxt,
                catFilter === cat.toLowerCase() && styles.catTxtSelected, // ← activates on pick
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredFavs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.darkGray, padding: 20},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
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
  list: {paddingBottom: '100%'},

  /* category ribbon */
  catScroll: {
    paddingHorizontal: spacing.s,
    marginBottom: spacing.l,
    alignItems: 'center',
    height: 44,
  },
  catBtn: {
    minWidth: 80,
    height: 32,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.gray31,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTxt: {color: colors.grey, fontSize: 14},
  catSel: {
    backgroundColor: colors.moderateRed,
    borderColor: colors.moderateRed,
  },
  catTxtSelected: {
    color: colors.white, // when the button is selected
  },

  itemContainer: {
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
  heartIcon: {position: 'absolute', top: 8, right: 8},
});
