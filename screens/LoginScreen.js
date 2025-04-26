// screens/LoginScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../services/firebase';
import {colors, typography, button, spacing} from '../theme/theme';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.heading}>Log in</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.grey}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.grey}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.redirect}>Forgot password?</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonStyle}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}} />

      <View style={styles.bottomContainer}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={button.secondary}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    padding: 20,
    justifyContent: 'center',
  },
  redirect: {
    ...typography.paragraph3,
    color: colors.blue,
    marginBottom: spacing.m,
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  link: {
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  buttonStyle: {
    ...button.primary,
    marginBottom: spacing.xxl,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05
  },
  topContainer: {
    alignItems: 'left',
    marginTop: height * 0.3
  },
});
