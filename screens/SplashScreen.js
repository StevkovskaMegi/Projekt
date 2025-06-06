// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation }    from '@react-navigation/native';   // ⬅️

export default function SplashScreen({ }) {
    // če prop ni podan (npr. v App.js), vzamemo useNavigation
// SplashScreen.js



  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <ActivityIndicator size="small" color="#C13551" style={styles.loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: '#C13551',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  loading: {
    marginTop: 20,
  },
});
