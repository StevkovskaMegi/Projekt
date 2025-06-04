import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../theme/theme';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OutfitDetailsScreen({ route, navigation }) {
  const { outfit } = route.params;
  const [currentOutfit, setCurrentOutfit] = useState(outfit);
  const [clothes, setClothes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClothes = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;
      const snap = await firestore()
        .collection('clothes')
        .where('userId', '==', uid)
        .get();
      setClothes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchClothes();
  }, []);

  const categories = {
    top: ['Shirts', 'Tops', 'Blouses', 'Sweaters'],
    bottom: ['Pants', 'Jeans', 'Skirts'],
    shoes: ['Shoes', 'Boots', 'Sneakers', 'Heels'],
    jacket: ['Jackets'],
    dress: ['Dresses'],
    accessories: ['Accessories'],
  };

  const generateElement = async (categoryKeys, label) => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const snap = await firestore()
      .collection('clothes')
      .where('userId', '==', uid)
      .get();

    const clothesList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const filtered = clothesList.filter(c => categoryKeys.includes(c.category));
    if (filtered.length === 0) return;
    const newItem = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentOutfit(prev => ({ ...prev, [label]: newItem }));
  };

  const renderSingleItem = (item, label) => (
    <View style={styles.singleItemContainer} key={label}>
      {item && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TouchableOpacity
        style={styles.changeBtn}
        onPress={() => generateElement(categories[label], label)}>
        <Text style={styles.changeTxt}>Change</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSave = () => {
    navigation.navigate('OutfitGenerator', {updatedOutfit: currentOutfit});
  };

  if (loading || !clothes) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}> 
        <ActivityIndicator size="large" color={colors.moderateRed} />
      </View>
    );
  }

  const components = [
    { key: 'top', item: currentOutfit.top },
    { key: 'bottom', item: currentOutfit.bottom },
    { key: 'shoes', item: currentOutfit.shoes },
    { key: 'jacket', item: currentOutfit.jacket },
    { key: 'dress', item: currentOutfit.dress },
    { key: 'accessories', item: currentOutfit.accessories },
  ].filter(c => c.item);

  return (
    <View style={styles.fullContainer}>
      <FlatList
        data={components}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => renderSingleItem(item.item, item.key)}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.description}>{currentOutfit.description}</Text>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveTxt}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
  },
  singleItemContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: SCREEN_WIDTH * 0.7,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: spacing.s,
    color: colors.grey,
  },
  changeBtn: {
    marginTop: spacing.s,
    backgroundColor: colors.moderateRed,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    ...typography.paragraph2,
    color: colors.white,
    margin: spacing.l,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.moderateRed,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: spacing.xl,
  },
  saveTxt: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
