import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const signupWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
};

export const logout = () => {
  return signOut(auth);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email.trim());
};

export const changePassword = (password: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }
  return updatePassword(auth.currentUser, password);
};

export const watchAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
