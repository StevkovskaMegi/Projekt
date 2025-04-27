// services/firebase.js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAUFhZbfirRiiN8AhoXalFdtTDhhISWi6M',
  authDomain: 'what2wear-e2379.firebaseapp.com',
  projectId: 'what2wear-e2379',
  storageBucket: 'what2wear-e2379.appspot.com',
  messagingSenderId: "511340597956",
  appId: '1:511340597956:android:bea09a8a1e5158f47bef91',
};

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const firestore = getFirestore(app);
// export const storage = getStorage(app);
export { auth, firestore };
