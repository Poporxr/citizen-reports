import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { getCachedItem, setCachedItem } from "./cache";

export interface CommentDoc {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: any;
  userId?: string;
  time?: string;
}

export function formatCommentTime(timestamp: any): string {
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
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  return `${diffInDays}d ago`;
}

/**
 * Realtime comments listener with offline cache support
 */
export function subscribeComments(
  incidentId: string,
  onData: (comments: CommentDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !incidentId) {
    onData([]);
    return () => {};
  }

  const cacheKey = `comments_${incidentId}`;

  // Instant local cache read
  getCachedItem<CommentDoc[]>(cacheKey).then((cached) => {
    if (cached && cached.length > 0) {
      onData(cached);
    }
  });

  const commentsCol = collection(db, "incidents", incidentId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CommentDoc[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        list.push({
          id: snap.id,
          author: data.author || "Community Member",
          avatar: data.avatar || "CM",
          text: data.text || "",
          createdAt: data.createdAt,
          userId: data.userId || "",
          time: formatCommentTime(data.createdAt),
        });
      });

      // Save to cache
      setCachedItem(cacheKey, list);
      onData(list);
    },
    (error) => {
      console.warn(`[Comments] Subscription error for ${incidentId}:`, error);
      onError?.(error);
    }
  );
}

/**
 * Add a new comment to an incident
 */
export async function addComment(
  incidentId: string,
  input: {
    author: string;
    avatar: string;
    text: string;
    userId?: string;
  }
): Promise<string> {
  if (!isFirebaseConfigured || !incidentId || !input.text.trim()) {
    throw new Error("Invalid comment input");
  }

  const commentsCol = collection(db, "incidents", incidentId, "comments");
  const newRef = doc(commentsCol);

  const commentData = {
    id: newRef.id,
    author: input.author.trim() || "Anonymous",
    avatar: input.avatar.trim() || "AN",
    text: input.text.trim(),
    createdAt: serverTimestamp(),
    userId: input.userId || "",
  };

  await setDoc(newRef, commentData);
  return newRef.id;
}
