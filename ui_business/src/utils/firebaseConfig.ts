import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {getAuth, GoogleAuthProvider } from 'firebase/auth';
import { configDetails } from './firebaseConfigDetails';

const firebaseConfig = configDetails;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const authGoogleProvider = new GoogleAuthProvider();

auth.useDeviceLanguage();

export const db = getFirestore(app);
export {auth, authGoogleProvider};
