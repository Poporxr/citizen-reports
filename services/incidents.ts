import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Category, Incident } from "../data/incidents";
import { db, isFirebaseConfigured, storage } from "../lib/firebase";
import { getCachedItem, setCachedItem } from "./cache";

export interface IncidentDoc {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  userId: string;
  userName: string;
  createdAt: any;
  likesCount?: number;
  commentsCount?: number;
}

export function docToIncident(doc: IncidentDoc): Incident {
  return {
    id: doc.id,
    category: doc.category,
    title: doc.title,
    description: doc.description,
    location: doc.locationName || "Location unavailable",
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
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
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

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image file to Cloudinary (with fallback to Firebase Storage)
 */
export async function uploadIncidentImage(
  imageUri: string,
  userId: string
): Promise<string> {
  // 1. Prefer Cloudinary if configured
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `incident_${userId}_${Date.now()}.jpg`,
      } as any);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("folder", `incidents/${userId}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await response.json();
      if (!response.ok || !json.secure_url) {
        throw new Error(json.error?.message || "Cloudinary upload failed");
      }
      return json.secure_url;
    } catch (error: any) {
      console.warn("Cloudinary upload failed, attempting fallback:", error);
    }
  }

  // 2. Fallback to Firebase Storage
  if (isFirebaseConfigured) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `${Date.now()}.jpg`;
      const storageRef = ref(storage, `incidents/${userId}/${filename}`);

      await uploadBytes(storageRef, blob, {
        contentType: "image/jpeg",
      });

      return await getDownloadURL(storageRef);
    } catch (error: any) {
      console.error("Storage upload error:", error);
      throw new Error(
        error.message || "Failed to upload incident picture."
      );
    }
  }

  throw new Error(
    "No storage service is configured. Please check your credentials in .env"
  );
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
  const notificationRef = doc(collection(db, "notifications"));

  const incidentData = {
    id: newDocRef.id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    imageUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    locationName: input.locationName?.trim() || null,
    userId: input.userId,
    userName: input.userName || "Anonymous",
    createdAt: serverTimestamp(),
  };

  const notificationData = {
    type: "new_incident",
    title: "New incident reported",
    message: `${input.category} · ${incidentData.locationName || input.title.trim()}`,
    incidentId: newDocRef.id,
    incidentTitle: input.title.trim(),
    category: input.category,
    imageUrl,
    actorId: input.userId,
    actorName: input.userName || "Anonymous",
    createdAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(newDocRef, incidentData);
  batch.set(notificationRef, notificationData);
  await batch.commit();
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

  // Instant local cache read
  getCachedItem<IncidentDoc[]>("feed_incidents").then((cached) => {
    if (cached && cached.length > 0) {
      onData(cached);
    }
  });

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
          latitude: typeof data.latitude === "number" ? data.latitude : null,
          longitude: typeof data.longitude === "number" ? data.longitude : null,
          locationName: data.locationName || null,
          userId: data.userId || "",
          userName: data.userName || "Anonymous",
          createdAt: data.createdAt,
          likesCount: typeof data.likesCount === "number" ? data.likesCount : 0,
          commentsCount: typeof data.commentsCount === "number" ? data.commentsCount : 0,
        });
      });
      setCachedItem("feed_incidents", list);
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

  // Instant local cache read
  getCachedItem<IncidentDoc[]>(`my_reports_${userId}`).then((cached) => {
    if (cached && cached.length > 0) {
      onData(cached);
    }
  });

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
          latitude: typeof data.latitude === "number" ? data.latitude : null,
          longitude: typeof data.longitude === "number" ? data.longitude : null,
          locationName: data.locationName || null,
          userId: data.userId || "",
          userName: data.userName || "Anonymous",
          createdAt: data.createdAt,
          likesCount: typeof data.likesCount === "number" ? data.likesCount : 0,
          commentsCount: typeof data.commentsCount === "number" ? data.commentsCount : 0,
        });
      });

      // Sort newest first client-side (avoids needing a Firestore composite index)
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      setCachedItem(`my_reports_${userId}`, list);
      onData(list);
    },
    (error) => {
      console.error("Firestore subscribeMyReports error:", error);
      onError?.(error);
    }
  );
}

/**
 * Fetch a single incident by ID with caching
 */
export async function getIncidentById(id: string): Promise<IncidentDoc | null> {
  if (!isFirebaseConfigured || !id) return null;
  const cached = await getCachedItem<IncidentDoc>(`incident_${id}`);
  if (cached) {
    return cached;
  }
  try {
    const docSnap = await getDoc(doc(db, "incidents", id));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    const item: IncidentDoc = {
      id: docSnap.id,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "Other",
      imageUrl: data.imageUrl || "",
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
      locationName: data.locationName || null,
      userId: data.userId || "",
      userName: data.userName || "Anonymous",
      createdAt: data.createdAt,
      likesCount: typeof data.likesCount === "number" ? data.likesCount : 0,
      commentsCount: typeof data.commentsCount === "number" ? data.commentsCount : 0,
    };
    setCachedItem(`incident_${id}`, item);
    return item;
  } catch (err) {
    console.error("Error fetching incident by ID:", err);
    return null;
  }
}
