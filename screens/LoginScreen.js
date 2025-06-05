// screens/LoginScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableWithoutFeedback} from 'react-native';

import {colors, typography, button, spacing} from '../theme/theme';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
export default function LoginScreen({navigation}) {
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetError, setResetError] = useState(null);

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
    } catch (err) {
      setError('Invalid email or password.');
    }
  };
  console.log('Modal visible?', forgotModalVisible);

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(resetEmail);
      setForgotModalVisible(false);
      setResetEmail('');
      setError(null);

      setTimeout(() => {
        navigation.navigate('Login', {from: 'reset'});
      }, 300);
    } catch (err) {
      setResetError('Failed to send password reset email.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
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
          secureTextEntry={true}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          textContentType="password"
        />

        <TouchableOpacity
          onPress={() => {
            setResetEmail(email);
            setForgotModalVisible(true);
            console.log('Forgot password pressed');
          }}>
          <Text style={styles.redirect}>Forgot password?</Text>
        </TouchableOpacity>

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
      {forgotModalVisible && (
        <TouchableWithoutFeedback onPress={() => setForgotModalVisible(false)}>
          <View style={styles.absoluteModal}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Reset Password</Text>

                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={colors.grey}
                  style={styles.input}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                />
                {resetError && <Text style={styles.error}>{resetError}</Text>}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handlePasswordReset}>
                  <Text style={styles.buttonStyleEmail}>Send Email</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
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
    borderColor: colors.gray31,
    borderWidth: 1,
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
    color: colors.grey,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  buttonStyle: {
    ...button.primary,
    marginBottom: spacing.xxl,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  topContainer: {
    alignItems: 'absolute',
    marginTop: height * 0.3,
  },
  absoluteModal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxHeight: '30%',
  },
  modalHeading: {
    color: colors.white,
    fontSize: 20,
    marginBottom: spacing.m,
    textAlign: 'left',
  },
  cancelText: {
    color: colors.moderateRed,
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    marginBottom: spacing.xxl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: spacing.m,
    zIndex: 10,
    top: 40,
  },
  buttonStyleEmail: {
    ...button.primary,
    textAlign: 'center',
  },
});
