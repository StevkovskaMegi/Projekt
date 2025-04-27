// // screens/SignUpScreen.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../services/firebase';
// import { colors, typography } from '../theme/theme';

// export default function SignUpScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState(null);

//   const handleSignUp = async () => {
//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       navigation.navigate('Splash');
//     } catch (err) {
//       setError('Something went wrong. Try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign up</Text>

//       <TextInput
//         placeholder="email"
//         placeholderTextColor={colors.grey}
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="password"
//         placeholderTextColor={colors.grey}
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TextInput
//         placeholder="confirm Password"
//         placeholderTextColor={colors.grey}
//         style={styles.input}
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//       />

//       {error && <Text style={styles.error}>{error}</Text>}

//       <TouchableOpacity style={styles.button} onPress={handleSignUp}>
//         <Text style={typography.buttonText}>Sign up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     ...typography.subheading,
//     marginBottom: 30,
//   },
//   input: {
//     backgroundColor: '#2A2A2A',
//     borderRadius: 10,
//     padding: 12,
//     width: '100%',
//     color: colors.white,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: colors.primary,
//     padding: 12,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   error: {
//     color: 'red',
//     marginBottom: 10,
//   },
// });