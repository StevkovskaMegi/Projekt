// screens/ProfileScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,Modal,TextInput, Alert
} from 'react-native';
import {colors, typography, spacing} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons'; // back arrow icon
import {auth, firestore} from '../services/firebase'; // already good
import {launchImageLibrary} from 'react-native-image-picker';
const IMGUR_CLIENT_ID = 'f46bb4113dda510';

export default function ProfileScreen({navigation}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({username: '', bio: ''});
  const [savingProfile, setSavingProfile] = useState(false);
  const openEditor = () => {
    setForm({
      username: userData?.username || '',
      bio: userData?.bio || '',
    });
    setEditing(true);
  };
  const saveProfile = async () => {
    if (!auth().currentUser) return;
    setSavingProfile(true);
    try {
      await firestore().collection('users').doc(auth().currentUser.uid).update({
        username: form.username.trim(),
        bio: form.bio.trim(),
      });
      setUserData(prev => ({
        ...prev,
        username: form.username.trim(),
        bio: form.bio.trim(),
      }));
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  /* helper – upload to Imgur and return the https link */
  const uploadAvatarToImgur = async localUri => {
    const form = new FormData();
    form.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });
    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {Authorization: `Client-ID ${IMGUR_CLIENT_ID}`},
      body: form,
    });
    const js = await res.json();
    if (js.success && js.data.link) return js.data.link;
    throw new Error(js.data?.error || 'Imgur upload failed');
  };

  /* pick + upload + save */
  const changeAvatar = async () => {
    const resp = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (resp.didCancel || resp.errorCode) return; // user cancelled

    setUploading(true);
    try {
      const localUri = resp.assets[0].uri;
      const url = await uploadAvatarToImgur(localUri);

      // save in Firestore
      await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .update({avatarUrl: url});

      // update local UI
      setUserData(prev => ({...prev, avatarUrl: url}));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          if (userDoc.exists) {
            const profileData = userDoc.data();

            setUserData({
              email: user.email, // 📩 from auth
              username: profileData.username,
              name: profileData.fullName, // 🧑 from Firestore
              bio: profileData.bio,
              avatarUrl: profileData.avatarUrl || null, // 📝 from Firestore
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        {uploading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Image
              source={
                userData?.avatarUrl
                  ? {uri: userData.avatarUrl}
                  : require('../assets/images/avatarPlaceholder.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity onPress={changeAvatar}>
              <Text style={styles.editPicture}>Edit picture</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userData?.name || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{userData?.username || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>{userData?.bio || 'No bio yet'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData?.email || 'N/A'}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={openEditor}>
        <Text style={styles.settingsLink}>Edit profile</Text>
      </TouchableOpacity>

      {/* Settings Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsLink}>Personal information settings</Text>
      </TouchableOpacity>
      <Modal visible={editing} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit profile</Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.grey}
              style={styles.modalInput}
              value={form.username}
              onChangeText={t => setForm({...form, username: t})}
            />

            <TextInput
              placeholder="Bio"
              placeholderTextColor={colors.grey}
              style={[styles.modalInput, {height: 80}]}
              value={form.bio}
              multiline
              onChangeText={t => setForm({...form, bio: t})}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.m,
              }}>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveProfile} disabled={savingProfile}>
                <Text style={styles.saveTxt}>
                  {savingProfile ? 'Saving…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    padding: spacing.l,
  },
  backButton: {
    marginBottom: spacing.m,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.s,
  },
  editPicture: {
    ...typography.paragraph2,
    color: colors.white,
  },
  infoContainer: {
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  label: {
    ...typography.paragraph2,
    color: colors.white,
  },
  value: {
    ...typography.paragraph2,
    color: colors.white,
    textAlign: 'right',
  },
  settingsLink: {
    ...typography.paragraph2,
    color: colors.blue,
    textAlign: 'left',
    marginTop: spacing.m,
  },
  modalWrap: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: colors.darkGray1,
    padding: spacing.l,
    borderRadius: 12,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.white,
    marginBottom: spacing.m,
  },
  modalInput: {
    backgroundColor: colors.darkGray,
    color: colors.white,
    borderRadius: 8,
    borderColor: colors.gray31,
    borderWidth: 1,
    padding: 10,
    marginBottom: spacing.s,
  },
  cancelTxt: {color: colors.grey, fontSize: 16},
  saveTxt: {color: colors.moderateRed, fontSize: 16, fontWeight: 'bold'},
});
