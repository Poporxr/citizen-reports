import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Incident } from "../data/incidents";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  incident: Incident;
  onPress?: () => void;
};

export default function IncidentCard({ incident, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: incident.image }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{incident.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {incident.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {incident.description}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {incident.location}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{incident.time}</Text>
        </View>
        <Text style={styles.reporter}>Reported by {incident.reporter}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: colors.surface,
  },
  body: {
    padding: spacing.lg,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 23,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: 4,
  },
  meta: {
    fontSize: font.small,
    color: colors.textMuted,
    flexShrink: 1,
  },
  dot: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  reporter: {
    marginTop: spacing.sm,
    fontSize: font.tiny,
    color: colors.textMuted,
  },
});
