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

export default function SettingsScreen({navigation}) {
  const [showPasswordInputs, setShowPasswordInputs] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

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
            <TextInput
              placeholder="Enter your new password"
              placeholderTextColor={colors.white}
              style={[
                styles.input,
                isNewPasswordFocused && styles.inputFocused, 
              ]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setIsNewPasswordFocused(true)}
              onBlur={() => setIsNewPasswordFocused(false)}
            />
            <TextInput
              placeholder="Confirm your new password"
              placeholderTextColor={colors.white}
              style={[
                styles.input,
                isConfirmPasswordFocused && styles.inputFocused, 
              ]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
            />
          </>
        )}

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Two-Factor Authentication</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Change Username</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Change Email</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>
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
    borderColor: colors.moderateRed, // or any color you want on focus
    borderWidth: 2,
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
