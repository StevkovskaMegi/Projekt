import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, typography, button, spacing} from '../theme/theme';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export default function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hey, trendsetter!</Text>
      <Text style={styles.subtitle}>Explore new styles</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('createYourLook')}>
        <Text style={styles.signupText}>Create your own look</Text>
      </TouchableOpacity>

      <View style={styles.insideContainer}>
        {/* <Image
          source={require('../assets/images/image.png')}
          style={styles.logo}
        /> */}
        <Text style={styles.text}>Style it your way-mix, match, and slay</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGray,
    justifyContent: 'left',
    alignItems: 'left',
    paddingTop: spacing.xl,
    paddingLeft: spacing.m,
  },
  insideContainer: {
    backgroundColor: colors.gray31,
    marginTop: spacing.xl,
    padding: spacing.s,
    marginRight: spacing.m,
    borderRadius: 20,
  },
  text: {
    ...typography.heading1,
    color: colors.white,
    fontStyle: 'italic',
  },
  header: {
    ...typography.heading1,
    color: colors.white,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.heading2,
    color: colors.moderateRed,
    fontStyle: 'italic',
    marginBottom: spacing.s,
  },
  button: {
    alignItems: 'left',
  },
  signupText: {
    ...button.primary,
    textAlign: 'center',
    width: width * 0.8,
  },
  logo: {
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});
