import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {getAuth, GoogleAuthProvider } from 'firebase/auth';
import { configDetails } from './firebaseConfigDetails';

const firebaseConfig = configDetails;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const authGoogleProvider = new GoogleAuthProvider();

auth.useDeviceLanguage();

export {db, auth, authGoogleProvider};
