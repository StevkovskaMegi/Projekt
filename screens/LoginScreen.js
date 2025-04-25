// // screens/LoginScreen.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../services/firebase';
// import { colors, typography } from '../theme/theme';
// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);

//   const handleLogin = async () => {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//     } catch (err) {
//       setError('Invalid email or password.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={typography.heading1}>Log in</Text>

//       <TextInput
//         placeholder="Email"
//         placeholderTextColor={colors.grey}
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         placeholderTextColor={colors.grey}
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       {error && <Text style={styles.error}>{error}</Text>}

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={typography.buttonText}>Sign In</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
//         <Text style={styles.link}>Don't have an account? Sign up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderColor: colors.grey,
//     color: colors.white,
//     marginBottom: 16,
//     paddingVertical: 8,
//   },
//   error: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: colors.primary,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   link: {
//     color: colors.primary,
//     textAlign: 'center',
//   },
// });
