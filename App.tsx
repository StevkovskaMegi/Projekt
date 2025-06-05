// App.js  (JS različica, brez TS tipov)
import React, { useEffect, useState } from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import SplashScreen from './screens/SplashScreen';
import AuthStack    from './navigation/AuthStack';
import AppStack     from './navigation/AppStack';   // iz točke 3

export default function App() {
  const [initialising, setInitialising] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(u => {
      console.log('⚡ AUTH EVENT, user =', u ? u.email : null);
      setUser(u);
      setInitialising(false);
    });
    return unsub;
  }, []);

  if (initialising) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
