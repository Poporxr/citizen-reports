import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import SectionHeader from "../../components/SectionHeader";
import { getIncidentById } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

export default function IncidentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = getIncidentById(String(id));

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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: incident.image }} style={styles.image} />
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{incident.category}</Text>
          </View>
          <Text style={styles.title}>{incident.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.meta}>{incident.location}</Text>
            <Text style={styles.meta}>•</Text>
            <Text style={styles.meta}>{incident.time}</Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="About this incident" />
            <Text style={styles.body}>{incident.description}</Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Location" />
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={22} color={colors.textMuted} />
              <Text style={styles.mapText}>Map preview</Text>
            </View>
            <Text style={styles.locationName}>{incident.location}</Text>
            <Text style={styles.coords}>Latitude: {incident.latitude}</Text>
            <Text style={styles.coords}>Longitude: {incident.longitude}</Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Reported by" />
            <View style={styles.reporterRow}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.reporterName}>{incident.reporter}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: "100%",
    height: 240,
    backgroundColor: colors.surface,
  },
  backButton: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    marginTop: spacing.md,
    fontSize: font.h1,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 31,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.xl,
  },
  body: {
    fontSize: font.body,
    color: colors.textMuted,
    lineHeight: 23,
  },
  mapPlaceholder: {
    height: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mapText: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  locationName: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: "500",
  },
  coords: {
    marginTop: 2,
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  reporterName: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: "500",
  },
});
