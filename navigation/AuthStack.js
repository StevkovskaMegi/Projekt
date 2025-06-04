// navigation/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BoardingScreen from '../screens/BoardingScreen';
import LoginScreen    from '../screens/LoginScreen';
import SignUpScreen   from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Boarding"
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Boarding" component={BoardingScreen} />
      <Stack.Screen name="Login"    component={LoginScreen}   />
      <Stack.Screen name="SignUp"   component={SignUpScreen}  />
    </Stack.Navigator>
  );
}
