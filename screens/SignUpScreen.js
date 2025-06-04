// screens/SignUpScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {colors, typography, button, spacing} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SignUpScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await firestore().collection('users').doc(userCredential.user.uid).set({
        email: email,
        username: '',
        bio: '',
        avatarUrl: '',
        fullName: '',
        twoFactorEmail:email,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
      });

      // Reset fields first
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setLoading(false); // stop loading before navigating
      navigation.navigate('Login', {from: 'SignUp'});
    } catch (err) {
      setLoading(false);

      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonStyle}>Sign up</Text>
        </TouchableOpacity>
      )}
      {successVisible && (
        <View style={styles.successToast}>
          <Text style={styles.successText}>Registration successful!</Text>
        </View>
      )}
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
  successToast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  successText: {
    color: '#fff',
    fontWeight: 'bold',
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
});
