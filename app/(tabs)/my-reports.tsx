import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import IncidentCard from "../../components/IncidentCard";
import { myReports } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

const segments = ["All", "Active"] as const;

export default function MyReportsScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<(typeof segments)[number]>("All");

  const visible =
    segment === "All" ? myReports : myReports.filter((report) => report.active);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>Incidents you've submitted</Text>
      </View>

      <View style={styles.segmented}>
        {segments.map((item) => {
          const active = segment === item;
          return (
            <Pressable
              key={item}
              onPress={() => setSegment(item)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <EmptyState
            title="No reports yet"
            message="When you report an incident, it'll appear here."
            actionLabel="Report an Incident"
            onAction={() => router.push("/create")}
          />
        ) : (
          visible.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onPress={() => router.push(`/incident/${incident.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: font.small,
    color: colors.textMuted,
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  segment: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.background,
  },
  segmentText: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: "600",
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
