// screens/ProfileScreen.js
import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity,ActivityIndicator} from 'react-native';
import {colors, typography, spacing} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons'; // back arrow icon
import { auth, firestore } from '../services/firebase'; // already good

export default function ProfileScreen({navigation}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('N/A');


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const profileData = userDoc.data();
        
            setUserData({
              email: user.email,              // 📩 from auth
              username: profileData.username, // 🧑 from Firestore
              bio: profileData.bio,            // 📝 from Firestore
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
        {/* <Image source={require('../assets/images/avatar.png')} style={styles.avatar} /> */}
        <Text style={styles.editPicture}>Edit picture</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userData?.username || 'No username'}</Text>
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

      {/* Settings Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsLink}>Personal information settings</Text>
      </TouchableOpacity>
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
});
