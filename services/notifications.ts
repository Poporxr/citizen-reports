import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Category } from "../data/incidents";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { formatRelativeTime } from "./incidents";

export type NotificationType = "new_incident";

export interface NotificationDoc {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  incidentId: string;
  incidentTitle: string;
  category: Category;
  imageUrl?: string;
  actorId: string;
  actorName: string;
  createdAt: any;
}

export interface NotificationReadDoc {
  id: string;
  notificationId: string;
  userId: string;
  readAt: any;
}

export type NotificationListItem = NotificationDoc & {
  read: boolean;
  time: string;
};

function getTimestampMs(timestamp: any): number {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (timestamp.seconds) return timestamp.seconds * 1000;
  if (timestamp instanceof Date) return timestamp.getTime();
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function docToNotification(id: string, data: any): NotificationDoc {
  return {
    id,
    type: data.type || "new_incident",
    title: data.title || "New incident reported",
    message: data.message || "",
    incidentId: data.incidentId || "",
    incidentTitle: data.incidentTitle || "",
    category: data.category || "Other",
    imageUrl: data.imageUrl || undefined,
    actorId: data.actorId || "",
    actorName: data.actorName || "Community Member",
    createdAt: data.createdAt,
  };
}

export function subscribeNotifications(
  userId: string | undefined,
  onData: (items: NotificationListItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !userId) {
    onData([]);
    return () => {};
  }

  let notifications: NotificationDoc[] = [];
  let readIds = new Set<string>();

  const emit = () => {
    const visibleNotifications = notifications.filter(
      (item) => item.actorId !== userId
    );

    if (__DEV__) {
      console.log(
        `[Notifications] Loaded ${notifications.length}, showing ${visibleNotifications.length}`
      );
    }

    onData(
      visibleNotifications.map((item) => ({
        ...item,
        read: readIds.has(item.id),
        time: formatRelativeTime(item.createdAt),
      }))
    );
  };

  const notificationsQuery = collection(db, "notifications");
  const readsQuery = collection(db, "users", userId, "notificationReads");

  const unsubscribeNotifications = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      notifications = snapshot.docs
        .map((snap) => docToNotification(snap.id, snap.data()))
        .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
      emit();
    },
    (error) => {
      console.warn("[Notifications] Subscription error:", error);
      onError?.(error);
    }
  );

  const unsubscribeReads = onSnapshot(
    readsQuery,
    (snapshot) => {
      readIds = new Set(snapshot.docs.map((snap) => snap.id));
      emit();
    },
    (error) => {
      console.warn("[Notifications] Read-state subscription error:", error);
      onError?.(error);
    }
  );

  return () => {
    unsubscribeNotifications();
    unsubscribeReads();
  };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId || !notificationId) return;

  await setDoc(
    doc(db, "users", userId, "notificationReads", notificationId),
    {
      notificationId,
      userId,
      readAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const unsubscribe = subscribeNotifications(
      userId,
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      () => {
        setError("Could not load notifications. Reopen this page to try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  return { items, unreadCount, loading, error };
}

export function useUnreadNotificationCount(userId: string | undefined) {
  const { unreadCount } = useNotifications(userId);
  return unreadCount;
}
