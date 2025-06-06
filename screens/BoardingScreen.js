// screens/BoardingScreen.js
import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, typography, button, spacing} from '../theme/theme';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');


export default function BoardingScreen({navigation}) {
  console.log('Razpoložljivi screeni v AuthStack:',
  navigation.getState()?.routes?.map(r => r.name));
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image
          source={require('../assets/images/boarding.png')}
          style={[styles.image, {height: '50%'}]} 
        />

        <Text style={styles.title}>What2Wear</Text>
        <Text style={styles.subtitle}>Your daily outfit assistant</Text>
      </View>
      <View style={{flex: 1}} />

      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
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
  topContainer: {
    alignItems: 'center',
    marginTop: height * 0.3,
  },
  bottomContainer: {
    alignItems: 'center',
    height: height * 0.2,
    marginBottom: height * 0.1,
  },
  image: {
    height: 260,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  welcome: {
    ...typography.heading2,
    color: colors.white,
    fontStyle: 'italic',
  },
  title: {
    ...typography.heading1,
    color: colors.moderateRed,
    fontWeight: 'light',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.paragraph2,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#ccc',
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  loginText: {
    ...button.primary,
    textAlign: 'center',
    width: width * 0.4,
  },
  signupText: {
    ...button.secondary,
    textAlign: 'center',
    width: width * 0.4,
  },
});
