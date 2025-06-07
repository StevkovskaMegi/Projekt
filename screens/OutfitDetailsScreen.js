import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {colors, typography, spacing} from '../theme/theme';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function OutfitDetailsScreen({route, navigation}) {
  const {outfit, onSave} = route.params || {};
  const [currentOutfit, setCurrentOutfit] = useState(outfit);
  const [clothes, setClothes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUri, setPreviewUri] = useState(null);

  useEffect(() => {
    const fetchClothes = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;
      const snap = await firestore()
        .collection('clothes')
        .where('userId', '==', uid)
        .get();
      setClothes(snap.docs.map(d => ({id: d.id, ...d.data()})));
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
    const clothesList = snap.docs.map(d => ({id: d.id, ...d.data()}));
    const filtered = clothesList.filter(c => categoryKeys.includes(c.category));
    if (filtered.length === 0) return;
    const newItem = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentOutfit(prev => ({...prev, [label]: newItem}));
  };

  const renderSingleItem = (item, label) => (
    <View style={styles.thumbCard} key={label}>
      {/* Tap na thumbnail odpre full-screen modal */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          console.log('Thumbnail tapped, setting previewUri =', item.imageUrl);
          setPreviewUri(item.imageUrl);
        }}>
        <Image source={{uri: item.imageUrl}} style={styles.thumbImage} />
      </TouchableOpacity>

      <Text style={styles.thumbLabel}>{label.toUpperCase()}</Text>

      <TouchableOpacity
        style={styles.changeBtn}
        onPress={() => generateElement(categories[label], label)}>
        <Text style={styles.changeTxt}>Change</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSave = () => {
    onSave?.(currentOutfit);
    navigation.goBack();
  };

  if (loading || !clothes) {
    return (
      <View style={[styles.fullContainer, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color={colors.moderateRed} />
      </View>
    );
  }

  const components = [
    {key: 'top', item: currentOutfit.top},
    {key: 'bottom', item: currentOutfit.bottom},
    {key: 'shoes', item: currentOutfit.shoes},
    {key: 'jacket', item: currentOutfit.jacket},
    {key: 'dress', item: currentOutfit.dress},
    {key: 'accessories', item: currentOutfit.accessories},
  ].filter(c => c.item);

  return (
    <ScrollView
      style={styles.fullContainer}
      contentContainerStyle={styles.scrollWrap}
      showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* ■■ mreža kosov ■■ */}
      <FlatList
        data={components}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={item => item.key}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: spacing.m,
        }}
        renderItem={({item}) => renderSingleItem(item.item, item.key)}
      />

      {/* ■■ opis gumb ■■ */}
      <Text style={styles.description}>{currentOutfit.description}</Text>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveTxt}>Save the changes</Text>
      </TouchableOpacity>

      {/* ■■ PREVIEW MODAL ■■ */}
      <Modal
        visible={previewUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('onRequestClose – zapiram preview modal');
          setPreviewUri(null);
        }}>
        <View style={styles.modalWrap}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => {
              console.log('Close gumb klik – zapiram preview modal');
              setPreviewUri(null);
            }}>
            <Text style={styles.modalCloseTxt}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.fullImgWrap}
            onPress={() => {
              console.log('Tap na celozaslonsko sliko – zapiram preview modal');
              setPreviewUri(null);
            }}>
            <Image source={{uri: previewUri}} style={styles.modalImage} />
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    paddingVertical: spacing.s,
    
  },
  thumbCard: {
    width: SCREEN_WIDTH * 0.46,
    backgroundColor: '#222',
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingTop:'5%'
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
  },
  changeBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.moderateRed,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom:'10%'
  },
  saveTxt: {
    color: colors.white,
    fontWeight: 'bold',
  },

  /* ----- MODAL STYLES ----- */
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
    borderColor: colors.grey,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  modalCloseTxt: {
    color: colors.white,
    fontSize: 16,
  },
  fullImgWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 16,
  },

  scrollWrap: {
    paddingVertical: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
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
