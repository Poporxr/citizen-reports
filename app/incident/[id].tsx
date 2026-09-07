import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import { getIncidentById } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const categoryTheme: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Accident: { bg: "#FEE2E2", text: "#DC2626", icon: "car-outline" },
  Fighting: { bg: "#FFEDD5", text: "#EA580C", icon: "people-outline" },
  Rioting: { bg: "#EDE9FE", text: "#7C3AED", icon: "megaphone-outline" },
  Fire: { bg: "#FEE2E2", text: "#B91C1C", icon: "flame-outline" },
  Theft: { bg: "#E0E7FF", text: "#4F46E5", icon: "lock-closed-outline" },
  Other: { bg: "#F3F4F6", text: "#4B5563", icon: "alert-circle-outline" },
};

const mockComments = [
  {
    id: "c1",
    author: "Mary Jane",
    avatar: "MJ",
    text: "Emergency team arrived at the scene. Traffic is moving slowly.",
    time: "8 mins ago",
  },
  {
    id: "c2",
    author: "David K.",
    avatar: "DK",
    text: "Thanks for the update. Motorists should take the bypass road.",
    time: "15 mins ago",
  },
];

export default function IncidentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = getIncidentById(String(id));

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(
    incident ? Math.floor((Number(incident.id) * 19 + 7) % 40) + 12 : 24
  );
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);

  if (!incident) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Incident not found"
          message="This incident is no longer available."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const catStyle = categoryTheme[incident.category] ?? {
    bg: colors.surface,
    text: colors.textSecondary,
    icon: "alert-circle-outline" as keyof typeof Ionicons.glyphMap,
  };

  const initials = incident.reporter
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: "You",
        avatar: "ME",
        text: newComment.trim(),
        time: "Just now",
      },
    ]);
    setNewComment("");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ── Top Navigation Bar ── */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navButton}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={styles.navTitle} numberOfLines={1}>
          Incident Report
        </Text>

        <View style={styles.navRightActions}>
          <Pressable
            style={styles.navButton}
            onPress={() => setIsBookmarked((b) => !b)}
            hitSlop={8}
            accessibilityLabel="Bookmark incident"
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? colors.primary : colors.text}
            />
          </Pressable>

          <Pressable
            style={styles.navButton}
            hitSlop={8}
            accessibilityLabel="Share incident"
          >
            <Ionicons name="paper-plane-outline" size={20} color={colors.text} />
          </Pressable>

          <Pressable
            style={styles.navButton}
            hitSlop={8}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Author / Reporter Row ── */}
        <View style={styles.reporterRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {incident.active && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.reporterInfo}>
            <Text style={styles.reporterName} numberOfLines={1}>
              {incident.reporter}
            </Text>
            <Text style={styles.reporterMeta} numberOfLines={1}>
              {incident.time}
            </Text>
          </View>

          <Pressable
            style={[
              styles.followBtn,
              isFollowing && styles.followingBtn,
            ]}
            onPress={() => setIsFollowing((f) => !f)}
          >
            <Text
              style={[
                styles.followBtnText,
                isFollowing && styles.followingBtnText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        {/* ── Report Title ── */}
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>{incident.title}</Text>
        </View>

        {/* ── Expanded Media / Image ── */}
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: incident.image }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          {incident.active && (
            <View style={styles.liveOverlay}>
              <View style={styles.liveDot} />
              <Text style={styles.liveOverlayText}>ACTIVE REPORT</Text>
            </View>
          )}
        </View>

        {/* ── Location + Category ash card ── */}
        <View style={styles.locationCatCard}>
          <View style={styles.locationSide}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {incident.location}
              </Text>
            </View>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.categorySide}>
            <View style={[styles.catIconWrap, { backgroundColor: catStyle.bg }]}>
              <Ionicons name={catStyle.icon} size={16} color={catStyle.text} />
            </View>
            <View style={styles.catInfo}>
              <Text style={styles.catLabel}>Type</Text>
              <Text style={[styles.catValue, { color: catStyle.text }]}>
                {incident.category}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Coordinates row ── */}
        <View style={styles.coordsRow}>
          <Ionicons name="navigate-outline" size={13} color={colors.textMuted} />
          <Text style={styles.coordsText}>
            {incident.latitude.toFixed(4)}° N, {incident.longitude.toFixed(4)}° E
          </Text>
        </View>

        {/* ── Engagement Row ── */}
        <View style={styles.engagementRow}>
          <Pressable
            style={styles.engagementBtn}
            onPress={handleToggleLike}
            hitSlop={6}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? colors.danger : colors.textSecondary}
            />
            <Text
              style={[
                styles.engagementText,
                isLiked && { color: colors.danger, fontWeight: "700" },
              ]}
            >
              {likesCount}
            </Text>
          </Pressable>

          <View style={styles.engagementBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.engagementText}>{comments.length}</Text>
          </View>

          <View style={styles.engagementBtn}>
            <Ionicons name="eye-outline" size={19} color={colors.textSecondary} />
            <Text style={styles.engagementText}>542</Text>
          </View>

          <View style={{ flex: 1 }} />

          <Pressable
            hitSlop={6}
            onPress={handleToggleLike}
            style={styles.engagementBtn}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? colors.danger : colors.textSecondary}
            />
          </Pressable>

          <Pressable
            hitSlop={6}
            onPress={() => setIsBookmarked((b) => !b)}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? colors.primary : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ── Description ── */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.reportDescription}>{incident.description}</Text>
        </View>

        {/* ── Comments / Updates Feed ── */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            Community Updates ({comments.length})
          </Text>

          {comments.map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{item.avatar}</Text>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{item.author}</Text>
                  <Text style={styles.commentTime}>{item.time}</Text>
                </View>
                <Text style={styles.commentContent}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom Compact Comment Bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.commentInputWrap}>
          <TextInput
            placeholder="Add an update or comment..."
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            style={styles.commentInput}
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
          />
          {newComment.trim().length > 0 && (
            <Pressable
              onPress={handleAddComment}
              style={styles.sendButton}
              hitSlop={8}
            >
              <Ionicons name="arrow-up-circle" size={28} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },

  /* ── Top Navigation Bar ── */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  navTitle: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.xs,
  },
  navRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },

  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  /* ── Reporter Header ── */
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
  },
  reporterInfo: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
  reporterName: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.text,
  },
  reporterMeta: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 1,
  },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  followingBtn: {
    backgroundColor: colors.primaryGhost,
    borderColor: colors.border,
  },
  followBtnText: {
    fontSize: font.small - 1,
    fontWeight: "700",
    color: colors.primary,
  },
  followingBtnText: {
    color: colors.textMuted,
  },

  /* ── Title Section ── */
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  reportTitle: {
    fontSize: font.h3 + 1,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 25,
    letterSpacing: -0.2,
  },

  /* ── Expanded Media ── */
  mediaContainer: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: Math.min(SCREEN_WIDTH * 0.55, 240),
  },
  liveOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 20, 25, 0.8)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  liveOverlayText: {
    fontSize: font.tiny - 1,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  /* ── Location + Category card ── */
  locationCatCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: "#F1F3F5",
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  locationSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryGhost,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: font.tiny - 0.5,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  locationValue: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.text,
    marginTop: 1,
  },
  dividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  categorySide: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  catInfo: {},
  catLabel: {
    fontSize: font.tiny - 0.5,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  catValue: {
    fontSize: font.small,
    fontWeight: "700",
    marginTop: 1,
  },

  /* ── Coordinates ── */
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs + 2,
    paddingLeft: 2,
  },
  coordsText: {
    fontSize: font.tiny,
    color: colors.textMuted,
    fontWeight: "500",
  },

  /* ── Engagement Row ── */
  engagementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  engagementBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  engagementText: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  /* ── Description Section ── */
  descriptionSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  descriptionTitle: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  reportDescription: {
    fontSize: font.body - 0.5,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  /* ── Comments Section ── */
  commentsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  commentItem: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentAvatarText: {
    fontSize: font.tiny,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  commentBody: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.text,
  },
  commentTime: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  commentContent: {
    fontSize: font.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  /* ── Bottom Input Bar ── */
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  commentInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  commentInput: {
    flex: 1,
    fontSize: font.small + 1,
    color: colors.text,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: spacing.xs,
  },
});
