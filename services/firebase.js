// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'YOUR_KEY',
  authDomain: 'what2wear-e2379.firebaseapp.com',
  projectId: 'what2wear-e2379',
  storageBucket: 'what2wear-e2379.appspot.com',
  appId: '1:511340597956:android:bea09a8a1e5158f47bef91',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
