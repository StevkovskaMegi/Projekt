// screens/BoardingScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, typography } from '../theme/theme';

export default function BoardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/boarding.png')} style={styles.image} />

      <Text style={styles.welcome}>Welcome to</Text>
      <Text style={styles.title}>What2Wear</Text>
      <Text style={styles.subtitle}>Your daily outfit assistant</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    height: 260,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  welcome: {
    ...typography.heading2,
    color: '#fff',
    fontStyle: 'italic',
  },
  title: {
    ...typography.heading1,
    color: '#C13551',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  loginBtn: {
    backgroundColor: '#C13551',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
  signupBtn: {
    borderWidth: 1,
    borderColor: '#C13551',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  signupText: {
    color: '#C13551',
    fontSize: 16,
  },
});
