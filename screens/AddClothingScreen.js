// screens/AddClothingScreen.js

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomSelect from './modal/CustomSelect';
import {colors, typography, button, spacing} from '../theme/theme';

const IMGUR_CLIENT_ID = 'f46bb4113dda510';

export default function AddClothingScreen({navigation}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [localUri, setLocalUri] = useState('');
  const [imgurUrl, setImgurUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  /** 1️⃣ Pick a photo from the gallery */
  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, resp => {
      if (resp.didCancel) return;
      if (resp.errorCode) {
        Alert.alert('Error', resp.errorMessage);
        return;
      }
      const uri = resp.assets[0].uri;
      setLocalUri(uri);
      setImgurUrl(''); // clear any previous
    });
  };

  /** 2️⃣ Upload the picked image to Imgur & return the HTTPS link */
  const uploadToImgur = async () => {
    if (!localUri) return null;
    setUploading(true);

    // Prepare form data
    const form = new FormData();
    form.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });

    try {
      const res = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: form,
      });
      const json = await res.json();
      if (json.success && json.data.link) {
        setImgurUrl(json.data.link);
        return json.data.link;
      } else {
        throw new Error(json.data?.error || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Upload error', err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /** 3️⃣ Save the clothing item to Firestore */
  const handleSave = async () => {
    if (!name || !category || !color || (!localUri && !imgurUrl)) {
      Alert.alert(
        'Missing fields',
        'Please fill all fields and pick an image.',
      );
      return;
    }

    setSaving(true);
    try {
      // If we haven't yet uploaded, do it now
      const url = imgurUrl || (await uploadToImgur());
      if (!url) throw new Error('Image upload failed');

      // then save
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      await firestore().collection('clothes').add({
        name,
        category,
        color,
        imageUrl: url,
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: uid,
        isFavorite: false,
      });

      Alert.alert('Success', 'Clothing item added!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.heading}>Add new clothing</Text>

      <TextInput
        style={styles.input}
        placeholder="Name (e.g. silk dress)"
        placeholderTextColor={colors.grey}
        value={name}
        onChangeText={setName}
      />

      <CustomSelect
        value={category}
        onSelect={setCategory}
        options={categories} // ← Here’s the static list
        placeholder="Select Clothing Category"
      />
      <TextInput
        style={styles.input}
        placeholder="Color (e.g. red, navy blue)"
        placeholderTextColor={colors.grey}
        value={color}
        onChangeText={setColor}
      />

      <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
        <Text style={styles.pickText}>
          {localUri ? 'Change photo' : 'Choose photo'}
        </Text>
      </TouchableOpacity>

      {localUri ? (
        <Image source={{uri: localUri}} style={styles.preview} />
      ) : null}

      {uploading && <ActivityIndicator color={colors.moderateRed} />}

      <TouchableOpacity
        style={[styles.saveBtn, saving && {opacity: 0.6}]}
        onPress={handleSave}
        disabled={saving || uploading}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add Item'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + spacing.xxl,
  },
  back: {
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
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.darkGray1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    marginBottom: spacing.s,
    ...typography.paragraph2,
  },
  pickBtn: {
    backgroundColor: colors.darkGray1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  pickText: {
    color: colors.grey,
    ...typography.paragraph2,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: spacing.m,
  },
  saveBtn: {
    backgroundColor: colors.moderateRed,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  saveText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
