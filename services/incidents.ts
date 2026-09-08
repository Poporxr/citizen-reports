import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Category, Incident } from "../data/incidents";
import { db, isFirebaseConfigured, storage } from "../lib/firebase";

export interface IncidentDoc {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  latitude: number;
  longitude: number;
  locationName: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export function docToIncident(doc: IncidentDoc): Incident {
  return {
    id: doc.id,
    category: doc.category,
    title: doc.title,
    description: doc.description,
    location:
      doc.locationName ||
      `${doc.latitude ? doc.latitude.toFixed(3) : 0}, ${doc.longitude ? doc.longitude.toFixed(3) : 0}`,
    latitude: doc.latitude,
    longitude: doc.longitude,
    time: formatRelativeTime(doc.createdAt),
    reporter: doc.userName || "Anonymous",
    image: doc.imageUrl,
    active: true,
  };
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  category: Category;
  imageUri: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  userId: string;
  userName: string;
}

/**
 * Format Firestore timestamp into clean human-readable relative time
 */
export function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return "Just now";
  let date: Date;
  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "Recently";

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}

/**
 * Upload an image file to Firebase Storage
 * Path: incidents/{userId}/{timestamp}.jpg
 */
export async function uploadIncidentImage(
  imageUri: string,
  userId: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Please add your credentials to .env"
    );
  }

  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `incidents/${userId}/${filename}`);

    await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg",
    });

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error: any) {
    console.error("Storage upload error:", error);
    throw new Error(
      error.message || "Failed to upload incident picture to Firebase Storage."
    );
  }
}

/**
 * Create a new incident document in Firestore
 */
export async function createIncident(
  input: CreateIncidentInput
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Please add your credentials to .env"
    );
  }

  if (!input.title.trim()) {
    throw new Error("Please enter an incident title.");
  }
  if (!input.category) {
    throw new Error("Please select a category.");
  }
  if (!input.imageUri) {
    throw new Error("Please select or take an incident photo.");
  }

  // 1. Upload photo to Firebase Storage
  const imageUrl = await uploadIncidentImage(input.imageUri, input.userId);

  // 2. Create document in Firestore incidents collection
  const incidentsCol = collection(db, "incidents");
  const newDocRef = doc(incidentsCol);

  const incidentData = {
    id: newDocRef.id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    imageUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    locationName: input.locationName?.trim() || "Unknown Location",
    userId: input.userId,
    userName: input.userName || "Anonymous",
    createdAt: serverTimestamp(),
  };

  await setDoc(newDocRef, incidentData);
  return newDocRef.id;
}

/**
 * Realtime listener for the home feed (newest first)
 */
export function subscribeIncidents(
  onData: (incidents: IncidentDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, "incidents"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: IncidentDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "Other",
          imageUrl: data.imageUrl || "",
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          locationName: data.locationName || "",
          userId: data.userId || "",
          userName: data.userName || "Anonymous",
          createdAt: data.createdAt,
        });
      });
      onData(list);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error);
      onError?.(error);
    }
  );
}

/**
 * Realtime listener for reports created by the current user
 */
export function subscribeMyReports(
  userId: string,
  onData: (incidents: IncidentDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !userId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, "incidents"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: IncidentDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "Other",
          imageUrl: data.imageUrl || "",
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          locationName: data.locationName || "",
          userId: data.userId || "",
          userName: data.userName || "Anonymous",
          createdAt: data.createdAt,
        });
      });

      // Sort newest first client-side (avoids needing a Firestore composite index)
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      onData(list);
    },
    (error) => {
      console.error("Firestore subscribeMyReports error:", error);
      onError?.(error);
    }
  );
}

/**
 * Fetch a single incident by ID
 */
export async function getIncidentById(id: string): Promise<IncidentDoc | null> {
  if (!isFirebaseConfigured || !id) return null;
  try {
    const docSnap = await getDoc(doc(db, "incidents", id));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "Other",
      imageUrl: data.imageUrl || "",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      locationName: data.locationName || "",
      userId: data.userId || "",
      userName: data.userName || "Anonymous",
      createdAt: data.createdAt,
    };
  } catch (err) {
    console.error("Error fetching incident by ID:", err);
    return null;
  }
}
