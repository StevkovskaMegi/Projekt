// screens/SettingsScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import {colors, typography, spacing} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {EmailAuthProvider} from '@react-native-firebase/auth';

export default function SettingsScreen({navigation}) {
  const [showPasswordInputs, setShowPasswordInputs] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [currFocused, setCurrFocused] = useState(false);
  const userDoc = firestore().doc(`users/${auth().currentUser.uid}`);


  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password must be ≥ 6 characters');
      return;
    }

    try {
      setChangingPwd(true);
      const user = auth().currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPassword);

      // re-authenticate
      await user.reauthenticateWithCredential(cred);
      // set new password
      await user.updatePassword(newPassword);

      Alert.alert('Success', 'Password updated');
      // clear fields + collapse panel
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordInputs(false);
    } catch (e) {
      const msg =
        e.code === 'auth/wrong-password'
          ? 'Current password is incorrect'
          : e.message;
      Alert.alert('Error', msg);
    } finally {
      setChangingPwd(false);
    }
  };
  const togglePasswordFields = () => {
    setShowPasswordInputs(!showPasswordInputs);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Personal details</Text>

        <Text style={styles.description}>
          We use your personal information to customize your experience and keep
          your account secure.
        </Text>

        <TouchableOpacity style={styles.option} onPress={togglePasswordFields}>
          <Text style={styles.optionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        {showPasswordInputs && (
          <>
            {/* current password */}
            <TextInput
              placeholder="Current password"
              placeholderTextColor={colors.white}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onFocus={() => setCurrFocused(true)}
              onBlur={() => setCurrFocused(false)}
              style={[styles.input, currFocused && styles.inputFocused]}
            />

            {/* new password */}
            <TextInput
              placeholder="Enter your new password"
              placeholderTextColor={colors.white}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setIsNewPasswordFocused(true)}
              onBlur={() => setIsNewPasswordFocused(false)}
              style={[
                styles.input,
                isNewPasswordFocused && styles.inputFocused,
              ]}
            />

            {/* confirm */}
            <TextInput
              placeholder="Confirm your new password"
              placeholderTextColor={colors.white}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              style={[
                styles.input,
                isConfirmPasswordFocused && styles.inputFocused,
              ]}
            />

            {/* save button */}
            <TouchableOpacity
              style={[
                styles.option,
                {justifyContent: 'center', marginTop: spacing.s},
                changingPwd && {opacity: 0.6},
              ]}
              disabled={changingPwd}
              onPress={handleChangePassword}>
              <Text style={styles.optionText}>
                {changingPwd ? 'Saving…' : 'Confirm new password'}
              </Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  inputFocused: {
    borderColor: colors.gray31, // or any color you want on focus
    borderWidth: 1,
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
  content: {
    paddingBottom: spacing.xl,
  },
  heading: {
    ...typography.heading1,
    color: colors.white,
    marginBottom: spacing.m,
  },
  description: {
    ...typography.paragraph1,
    color: colors.white,
    marginBottom: spacing.l,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray31,
    borderRadius: 12,
    padding: 16,
    marginBottom: spacing.m,
  },
  optionText: {
    ...typography.paragraph2,
    color: colors.white,
  },
  input: {
    ...typography.paragraph2,
    borderColor: colors.white,
    backgroundColor: colors.darkGray1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: spacing.m,
    color: colors.white,
  },
});
