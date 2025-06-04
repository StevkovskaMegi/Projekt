// navigation/AppStack.js (ali kar v App.js)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator          from '../navigation/TabNavigator';
import HomeScreen            from '../screens/HomeScreen';
import UserScreen            from '../screens/UserScreen';
import SettingsScreen        from '../screens/SettingsScreen';
import AddClothingScreen     from '../screens/AddClothingScreen';
import OutfitGeneratorScreen from '../screens/OutfitGeneratorScreen';
import OutfitDetailsScreen   from '../screens/OutfitDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabNavigator"    component={TabNavigator} />
      <Stack.Screen name="Home"            component={HomeScreen} />
      <Stack.Screen name="User"            component={UserScreen} />
      <Stack.Screen name="Settings"        component={SettingsScreen} />
      <Stack.Screen name="AddClothing"     component={AddClothingScreen} />
      <Stack.Screen name="OutfitGenerator" component={OutfitGeneratorScreen} />
      <Stack.Screen name="OutfitDetails"   component={OutfitDetailsScreen} />
    </Stack.Navigator>
  );
}
