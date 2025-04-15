import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// isi konfigurasi sesuai dengan konfigurasi firebase kalian
const firebaseConfig = {
  apiKey: 'AIzaSyAbKTiz86aD3n7eVemez_r9vdcsWLJTxkM',
  authDomain: 'todolist-81de3.firebaseapp.com',
  projectId: 'todolist-81de3',
  storageBucket: 'todolist-81de3.firebasestorage.app',
  messagingSenderId: '879040545813',
  appId: '1:879040545813:web:b5a1967179205cb5623a1c',
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
