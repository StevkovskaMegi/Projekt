import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const colors = {
  moderateRed: '#c13551',
  charm: '#ce6a7e',
  white: '#FFFFFF',
  grey: '#7e7e7e',
  gray31: '#4f4f4f',
  darkGray: '#202020',
  highland: '#75975e',
  blue: '#8C91F3',
  darkGray1: '#2A2A2A'
};

export const typography = {
  heading1: {
    fontSize: 29,
    fontWeight: 'bold',
    fontFamily: 'PlayfairDisplay',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'medium',
    fontFamily: 'PlayfairDisplay',
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'semibold',
    fontFamily: 'PlayfairDisplay',
  },
  heading4: {
    fontSize: 17,
    fontWeight: 'regular',
    fontFamily: 'PlayfairDisplay',
  },
  paragraph1: {
    fontSize: 17,
    fontWeight: 'regular',
    fontFamily: 'Inter',
  },
  paragraph2: {
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: 'Inter',
  },

  paragraph3: {
    fontSize: 13,
    fontWeight: 'regular',
    fontFamily: 'Inter',
  }

};

export const button = {
  primary:{
    backgroundColor: colors.moderateRed,
    ...typography.paragraph2, 
    color: colors.white,
    paddingHorizontal: 20,   
    paddingVertical: 10,     
    borderRadius: 8,
    width: width * 0.5,
    textAlign: 'center', 
    
  },
  secondary:{
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

  }
};

export const spacing = {
  xs: 8,   // extra small
  s: 16,    // small
  m: 24,   // medium
  l: 32,   // large
  xl: 40,  // extra large
  xxl: 48
};


