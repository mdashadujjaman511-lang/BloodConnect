import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp, doc, updateDoc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection to Firestore
async function testConnection() {
  try {
    // Try to get a non-existent document from a test collection
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log("Firestore connection test successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. This often indicates an incorrect Firebase configuration.");
    } else {
      console.error("Firestore connection test error:", error);
    }
  }
}
testConnection();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signUpWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const updateUserProfile = (name: string) => {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, { displayName: name });
  }
};

// Firestore Helpers
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error: any, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
