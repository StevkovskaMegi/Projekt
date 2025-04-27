// screens/SignUpScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {colors, typography, button, spacing} from '../theme/theme';
import { setDoc, doc } from '@react-native-firebase/firestore';

export default function SignUpScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          email: email,
          username: '',
          bio: '',
          createdAt: new Date(),
        });

      navigation.navigate('Login');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else {
        console.error('Signup error:', err);
        setError('Something went wrong. Try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign up</Text>

      <TextInput
        placeholder="email"
        placeholderTextColor={colors.grey}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="password"
        placeholderTextColor={colors.grey}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        placeholder="confirm Password"
        placeholderTextColor={colors.grey}
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonStyle}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'left',
    padding: 20,
  },
  heading: {
    ...typography.heading1,
    color: colors.moderateRed,
    fontStyle: 'italic',
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.darkGray1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    color: colors.white,
    marginBottom: spacing.s,
  },
  buttonStyle: {
    ...button.primary,
    marginBottom: spacing.xxl,
  },
  button: {
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
