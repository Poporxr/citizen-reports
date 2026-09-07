import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChip from "../../components/CategoryChip";
import IncidentCard from "../../components/IncidentCard";
import { IncidentCardSkeleton } from "../../components/Skeleton";
import { filterCategories, incidents } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const visible =
    selected === "All"
      ? incidents
      : incidents.filter((incident) => incident.category === selected);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Compact Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.brand}>Citizen Report</Text>
          <Text style={styles.subtext}>Live community feed</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { backgroundColor: colors.surface },
            ]}
            onPress={() => router.push("/create")}
            accessibilityLabel="Report Incident"
          >
            <Ionicons name="camera-outline" size={21} color={colors.text} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { backgroundColor: colors.surface },
            ]}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={styles.notifBadge} />
          </Pressable>
        </View>
      </View>

      {/* ── Compact Category Filter Row ── */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsRow}
        >
          {filterCategories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={selected === category}
              onPress={() => setSelected(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Feed ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.feedContainer}>
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
          </View>
        ) : (
          <View style={styles.feedContainer}>
            {visible.map((incident, index) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                index={index}
                onPress={() => router.push(`/incident/${incident.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  headerTitleWrap: {
    justifyContent: "center",
  },
  brand: {
    fontSize: font.h2,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surfaceElevated,
  },
  filterSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  feedContainer: {
    width: "100%",
  },
});
