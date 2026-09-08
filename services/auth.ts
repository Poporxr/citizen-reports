import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: any;
}

export function formatAuthError(error: any): string {
  if (!error) return "An unknown error occurred.";
  const code = error.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email address.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Please add your credentials to .env"
    );
  }
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return credential.user;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Please add your credentials to .env"
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const credential = await createUserWithEmailAndPassword(
    auth,
    trimmedEmail,
    password
  );

  const user = credential.user;

  // Update Auth user displayName
  if (trimmedName) {
    try {
      await updateProfile(user, { displayName: trimmedName });
    } catch {
      // Non-blocking if profile display name update fails
    }
  }

  // Save user profile in Firestore `users` collection
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    name: trimmedName || "Anonymous",
    email: trimmedEmail,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function logoutUser(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !uid) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  } catch (err) {
    console.warn("Failed to fetch user profile:", err);
  }
  return null;
}
