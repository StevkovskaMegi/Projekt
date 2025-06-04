// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import BoardingScreen from './screens/BoardingScreen';
import HomeScreen from './screens/HomeScreen';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TabNavigator from './navigation/TabNavigator';
import UserScreen from './screens/UserScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddClothingScreen from './screens/AddClothingScreen';
import OutfitDetailsScreen from './screens/OutfitDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={BoardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen name="User" component={UserScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AddClothing" component={AddClothingScreen} />
        <Stack.Screen name="OutfitDetailsScreen" component={OutfitDetailsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
