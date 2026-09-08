import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { db, isFirebaseConfigured } from "../lib/firebase";

export interface LikeData {
  userId: string;
  createdAt: any;
}

/**
 * Toggle like for a user on an incident.
 * Returns true if liked, false if unliked.
 */
export async function toggleLike(
  incidentId: string,
  userId: string
): Promise<boolean> {
  if (!isFirebaseConfigured || !incidentId || !userId) {
    return false;
  }

  const likeRef = doc(db, "incidents", incidentId, "likes", userId);

  try {
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      await deleteDoc(likeRef);
      return false;
    } else {
      await setDoc(likeRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

/**
 * Realtime subscription to the likes subcollection for an incident.
 * Receives the current like count and whether the logged-in user has liked.
 */
export function subscribeLikes(
  incidentId: string,
  userId: string | undefined,
  onUpdate: (count: number, userLiked: boolean) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !incidentId) {
    onUpdate(0, false);
    return () => {};
  }

  const likesCol = collection(db, "incidents", incidentId, "likes");

  return onSnapshot(
    likesCol,
    (snapshot) => {
      const count = snapshot.size;
      const userLiked = userId
        ? snapshot.docs.some((d) => d.id === userId)
        : false;
      onUpdate(count, userLiked);
    },
    (error) => {
      console.warn(`Error subscribing to likes for ${incidentId}:`, error);
      onError?.(error);
    }
  );
}

/**
 * Hook to manage real-time likes for an array of incidents
 */
export function useIncidentLikes(incidentIds: string[], userId?: string) {
  const [likesMap, setLikesMap] = useState<
    Record<string, { count: number; userLiked: boolean }>
  >({});

  const idsKey = incidentIds.join(",");

  useEffect(() => {
    if (!incidentIds || incidentIds.length === 0) return;

    const unsubs: (() => void)[] = [];
    incidentIds.forEach((id) => {
      const unsub = subscribeLikes(id, userId, (count, userLiked) => {
        setLikesMap((prev) => ({
          ...prev,
          [id]: { count, userLiked },
        }));
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [idsKey, userId]);

  const handleToggleLike = useCallback(
    async (incidentId: string) => {
      if (!userId) {
        Alert.alert("Sign In Required", "Please sign in to upvote reports.");
        return;
      }

      // Optimistic update
      setLikesMap((prev) => {
        const curr = prev[incidentId] || { count: 0, userLiked: false };
        const nextLiked = !curr.userLiked;
        const nextCount = nextLiked
          ? curr.count + 1
          : Math.max(0, curr.count - 1);
        return {
          ...prev,
          [incidentId]: { count: nextCount, userLiked: nextLiked },
        };
      });

      try {
        await toggleLike(incidentId, userId);
      } catch (err) {
        console.warn("Failed to toggle like:", err);
      }
    },
    [userId]
  );

  return { likesMap, handleToggleLike };
}
