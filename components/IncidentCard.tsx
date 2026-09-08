import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Incident } from "../data/incidents";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  incident: Incident;
  onPress?: () => void;
  index?: number;
  likesCount?: number;
  commentsCount?: number;
  userHasLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Accident: { bg: "#FEE2E2", text: "#DC2626" },
  Fighting: { bg: "#FFEDD5", text: "#EA580C" },
  Rioting: { bg: "#EDE9FE", text: "#7C3AED" },
  Fire: { bg: "#FEE2E2", text: "#B91C1C" },
  Theft: { bg: "#E0E7FF", text: "#4F46E5" },
  Other: { bg: "#F3F4F6", text: "#4B5563" },
};

export default function IncidentCard({
  incident,
  onPress,
  likesCount = 0,
  commentsCount = 0,
  userHasLiked = false,
  onLike,
  onShare,
}: Props) {
  const catTheme = categoryColors[incident.category] ?? {
    bg: colors.surface,
    text: colors.textSecondary,
  };

  const initials = incident.reporter
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* ── Left Column: Avatar ── */}
      <View style={styles.avatarColumn}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {incident.active && <View style={styles.activeDot} />}
        </View>
      </View>

      {/* ── Right Column: Content ── */}
      <View style={styles.contentColumn}>
        {/* Author Header — name · time */}
        <View style={styles.headerRow}>
          <View style={styles.nameMetaWrap}>
            <Text style={styles.reporterName} numberOfLines={1}>
              {incident.reporter}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.timeText}>{incident.time}</Text>
          </View>
        </View>

        {/* Location + Category pills row under the author name */}
        <View style={styles.pillsRow}>
          <View style={styles.locationPill}>
            <Ionicons name="location-outline" size={11} color={colors.textMuted} />
            <Text style={styles.locationPillText} numberOfLines={1}>
              {incident.location}
            </Text>
          </View>
          <View style={[styles.catPill, { backgroundColor: catTheme.bg }]}>
            <Text style={[styles.catPillText, { color: catTheme.text }]}>
              {incident.category}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title} numberOfLines={2}>
          {incident.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {incident.description}
        </Text>

        {/* Expanded Media / Image */}
        {incident.image ? (
          <View style={styles.mediaWrap}>
            <Image
              source={{ uri: incident.image }}
              style={styles.image}
              resizeMode="cover"
            />
            {incident.active && (
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Engagement Row */}
        <View style={styles.actionRow}>
          <Pressable
            hitSlop={8}
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Ionicons
              name={userHasLiked ? "heart" : "heart-outline"}
              size={18}
              color={userHasLiked ? colors.danger : colors.textMuted}
            />
            <Text
              style={[
                styles.actionCount,
                userHasLiked && { color: colors.danger },
              ]}
            >
              {likesCount}
            </Text>
          </Pressable>

          <Pressable
            hitSlop={8}
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              onPress?.();
            }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color={colors.textMuted}
            />
            <Text style={styles.actionCount}>{commentsCount}</Text>
          </Pressable>

          <Pressable
            hitSlop={8}
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Ionicons
              name="share-social-outline"
              size={17}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
  },

  /* ── Left column: Avatar ── */
  avatarColumn: {
    width: 44,
    alignItems: "center",
    paddingTop: 2,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: font.small,
    fontWeight: "700",
    color: colors.primary,
  },
  activeDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
  },

  /* ── Right column: Content ── */
  contentColumn: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameMetaWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "nowrap",
    gap: 6,
  },
  reporterName: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.text,
    maxWidth: "60%",
  },
  dot: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  timeText: {
    fontSize: font.tiny,
    color: colors.textMuted,
    fontWeight: "400",
  },

  /* ── Pills row: location + category ── */
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 5,
    flexWrap: "wrap",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
  locationPillText: {
    fontSize: font.tiny,
    color: colors.textSecondary,
    fontWeight: "500",
    maxWidth: 140,
  },
  catPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
  catPillText: {
    fontSize: font.tiny - 0.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  title: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
    marginBottom: 3,
  },
  description: {
    fontSize: font.small,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  mediaWrap: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  image: {
    width: "100%",
    height: 190,
  },
  liveTag: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 20, 25, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  liveText: {
    fontSize: font.tiny - 1,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm + 2,
    paddingRight: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 2,
  },
  actionCount: {
    fontSize: font.small - 1,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
