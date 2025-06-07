import {Dimensions} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';

const {width, height} = Dimensions.get('window');
export const colors = {
  moderateRed: '#c13551',
  charm: '#ce6a7e',
  white: '#FFFFFF',
  grey: '#7e7e7e',
  gray31: '#4f4f4f',
  darkGray: '#202020',
  highland: '#75975e',
  blue: '#8C91F3',
  darkGray1: '#2A2A2A',
};
export const typography = {
  heading1: {
    fontSize: 29,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'medium',
    fontFamily: 'Lato-Bold',
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'semibold',
    fontFamily: 'Lato-BoldItalic',
    fontVariationSettings: 'wght 600',
  },
  heading4: {
    fontSize: 17,
    fontWeight: 'regular',
    fontFamily: 'Lato-Regular',
  },
  paragraph1: {
    fontSize: 17,
    fontWeight: 'regular',
    fontFamily: 'Lato-Regular',
  },
  paragraph2: {
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: 'Lato-Regular',
  },

  paragraph3: {
    fontSize: 13,
    fontWeight: 'regular',
    fontFamily: 'Lato-Regular',
  },
};

export const button = {
  primary: {
    backgroundColor: colors.moderateRed,
    ...typography.paragraph2,
    color: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: width * 0.5,
    textAlign: 'center',
  },
  secondary: {
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.moderateRed,
    color: colors.moderateRed,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: width * 0.3,
    alignSelf: 'center',
    textAlign: 'center',
  },
};

export const spacing = {
  xs: 8, // extra small
  s: 16, // small
  m: 24, // medium
  l: 32, // large
  xl: 40, // extra large
  xxl: 48,
};

export const tabBar = {
  container: {
    backgroundColor: colors.darkGray,
    borderTopWidth: 0.5,
    paddingVertical: 10,
    height: 70,
    shadowColor: colors.darkGray1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,  
  },
  icon: {
    defaultColor: colors.white,
    activeColor: colors.moderateRed,
    size: 30,
    padding: 10,
  },
  iconsByRoute: {
    Home: {
      name: 'home',
      library: 'AntDesign',
    },
    Clothes: {
      name: 'shirt-outline',
      library: 'Ionicons',
    },
    Ideas: {
      name: 'light-bulb',
      library: 'Octicons',
    },
    Favorites: {
      name: 'heart',
      library: 'Feather',
    },
    Profile: {
      name: 'user',
      library: 'Feather',
    },
  },
};
