import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import FadeInView from "../components/FadeInView";
import ScalePress from "../components/ScalePress";
import { useAuth } from "../contexts/AuthContext";
import {
  markNotificationRead,
  NotificationListItem,
  useNotifications,
} from "../services/notifications";
import { colors, font, radius, shadow, spacing } from "../theme";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Accident: "car",
  Fighting: "people",
  Rioting: "megaphone",
  Fire: "flame",
  Theft: "hand-left",
  Other: "alert-circle",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, error } = useNotifications(user?.uid);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const openNotification = async (item: NotificationListItem) => {
    if (user?.uid) {
      try {
        await markNotificationRead(user.uid, item.id);
      } catch (err) {
        console.warn("Failed to mark notification read:", err);
      }
    }

    if (item.incidentId) {
      router.push(`/incident/${item.incidentId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FadeInView delay={0} slideFrom={0} duration={300}>
        <View style={styles.header}>
          <ScalePress
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <View style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </View>
          </ScalePress>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>Realtime community updates</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </FadeInView>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <EmptyState
            icon="alert-circle-outline"
            title="Could not load notifications"
            message={error}
          />
        </ScrollView>
      ) : items.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <EmptyState
            icon="notifications-outline"
            title="No notifications yet"
            message="New incident reports from other users will appear here."
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {items.map((item, index) => (
            <FadeInView
              key={item.id}
              delay={Math.min(index * 35, 240)}
              slideFrom={8}
            >
              <NotificationRow item={item} onPress={() => openNotification(item)} />
            </FadeInView>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationListItem;
  onPress: () => void;
}) {
  const icon = categoryIcons[item.category] ?? "alert-circle";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !item.read && styles.rowUnread,
        pressed && styles.rowPressed,
        shadow.sm,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={19} color={colors.primary} />
        {!item.read ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text
          style={[styles.message, !item.read && styles.messageUnread]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.incidentTitle || item.category}
        </Text>
      </View>

      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: font.h3,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    marginTop: 1,
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  rowUnread: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryGhost,
  },
  rowPressed: {
    opacity: 0.82,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    fontWeight: "800",
  },
  time: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  message: {
    marginTop: 3,
    fontSize: font.small,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  messageUnread: {
    color: colors.text,
    fontWeight: "600",
  },
  meta: {
    marginTop: 4,
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  thumbnail: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
