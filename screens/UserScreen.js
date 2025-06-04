// screens/ProfileScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
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
  const [editingUsername, setEditingUsername] = useState(false);
  const [editing, setEditing] = useState(false); // za modal
  const [editingBio, setEditingBio] = useState(false);

  const [form, setForm] = useState({username: '', bio: ''});
  const [savingProfile, setSavingProfile] = useState(false);
  const handleSignOut = async () => {
    try {
      await auth().signOut(); // 🔑 Firebase odjava
      // navigation.reset({
      //   index: 0,
      //   routes: [{name: 'Login'}], // vrni se na prijavni ekran
      // });
      // navigation.navigate('Boarding');

    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };
  const ProfileRow = ({label, value, onPress}) => (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueWrap}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.rowValue}>
          {value}
        </Text>
        {onPress && ( // pokaži “>” samo kadar je to klikljivo
          <Ionicons name="chevron-forward" size={18} color={colors.grey} />
        )}
      </View>
    </TouchableOpacity>
  );

  const openEditorUsername = () => {
    setForm({
      username: userData?.username || '',
    });
    setEditingUsername(true);
  };

  const openEditorBio = () => {
    setForm({
      bio: userData?.bio || '',
    });
    setEditingBio(true);
  };
 const saveProfile = async () => {
  if (!auth().currentUser) return;

  setSavingProfile(true);
  try {
    const userRef = firestore().collection('users').doc(auth().currentUser.uid);
    const updates = {};

    if (editingUsername) {
      // Če urejamo username, posodobimo samo to in obvezno preverimo, da ni undefined
      updates.username = (form.username || '').trim();
    }
    if (editingBio) {
      // Če urejamo bio, posodobimo samo bio
      updates.bio = (form.bio || '').trim();
    }

    // Če ni ničesar za posodobiti, izstopimo
    if (Object.keys(updates).length === 0) {
      setSavingProfile(false);
      setEditingUsername(false);
      setEditingBio(false);
      return;
    }

    // Kličemo Firestore update le z ustreznimi polji
    await userRef.update(updates);

    // Posodobimo lokalni state
    setUserData(prev => ({
      ...prev,
      ...(updates.username !== undefined ? { username: updates.username } : {}),
      ...(updates.bio      !== undefined ? { bio:      updates.bio }      : {}),
    }));

    // Zapremo modal
    setEditingUsername(false);
    setEditingBio(false);

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
      {/* <View style={styles.infoContainer}>
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
      </TouchableOpacity> */}
      {/* ---------- profile rows ---------- */}
      <View style={styles.rowList}>
        <ProfileRow label="Name" value={userData?.name || 'N/A'} />
        <ProfileRow
          label="Username"
          value={userData?.username || 'N/A'}
          onPress={openEditorUsername}
        />
        <ProfileRow
          label="Bio"
          value={userData?.bio || 'No bio yet'}
          onPress={openEditorBio}
        />
        <ProfileRow label="Email" value={userData?.email || 'N/A'} />

       
      </View>

      {/* Settings Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsLink}>Change password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOutTxt}>Sign out</Text>
      </TouchableOpacity>
      <Modal visible={editingUsername} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Username</Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.grey}
              style={styles.modalInput}
              value={form.username}
              onChangeText={t => setForm({...form, username: t})}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.m,
              }}>
              <TouchableOpacity onPress={() => setEditingUsername(false)}>
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
      <Modal visible={editingBio} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Bio</Text>

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
              <TouchableOpacity onPress={() => setEditingBio(false)}>
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
    position:'absolute',
    margin:30,
    marginTop: 40
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop:spacing.xxl
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
    backgroundColor: '#0009',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: colors.darkGray,
    padding: spacing.l,
    borderRadius: 12,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.white,
    marginBottom: spacing.m,
  },
  modalInput: {
    backgroundColor: colors.darkGray1,
    color: colors.white,
    borderRadius: 8,
    borderColor: colors.gray31,
    borderWidth: 1,
    padding: 10,
    marginBottom: spacing.s,
  },
  cancelTxt: {color: colors.grey, fontSize: 16},
  saveTxt: {color: colors.moderateRed, fontSize: 16, fontWeight: 'bold'},
  signOutTxt: {
    ...typography.paragraph2,
    color: colors.moderateRed,
    textAlign: 'left',
    marginTop: spacing.m,
  },
  rowList: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    borderColor: colors.gray31,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomColor: colors.gray31,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  rowLabel: {
    width: '34%',
    ...typography.paragraph2,
    color: colors.grey,
  },

  rowValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowValue: {
    ...typography.paragraph2,
    color: colors.white,
    maxWidth: '90%',
  },
});
