// src/navigation/TabNavigator.js

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import {tabBar, colors} from '../theme/theme';
import {View} from 'react-native';  

// Import your screens
import HomeScreen from '../screens/HomeScreen';
// import ClothesScreen from '../screens/ClothesScreen';
// import IdeasScreen from '../screens/IdeasScreen';
// import FavoritesScreen from '../screens/FavoritesScreen';
import UserScreen from '../screens/UserScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          const {name, library} = tabBar.iconsByRoute[route.name];

          let IconComponent = Feather; // default fallback

          if (library === 'AntDesign') {
            IconComponent = AntDesign;
          } else if (library === 'Ionicons') {
            IconComponent = Ionicons;
          } else if (library === 'Octicons') {
            IconComponent = Octicons;
          } else if (library === 'Feather') {
            IconComponent = Feather;
          }

          return (
            <IconComponent
              name={name}
              size={tabBar.icon.size}
              color={
                focused ? tabBar.icon.activeColor : tabBar.icon.defaultColor
              }
            />
          );
        },
        tabBarStyle: tabBar.container,
        tabBarShowLabel: false,
        tabBarActiveTintColor: tabBar.icon.activeColor,
        tabBarInactiveTintColor: tabBar.icon.defaultColor,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={UserScreen} />

      {/* <Tab.Screen name="Clothes" component={ClothesScreen} />
      <Tab.Screen name="Ideas" component={IdeasScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
}
