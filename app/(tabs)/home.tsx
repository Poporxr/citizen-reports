import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChip from "../../components/CategoryChip";
import IncidentCard from "../../components/IncidentCard";
import SectionHeader from "../../components/SectionHeader";
import { filterCategories, incidents } from "../../data/incidents";
import { colors, font, spacing } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("All");

  const visible =
    selected === "All"
      ? incidents
      : incidents.filter((incident) => incident.category === selected);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Citizen Report</Text>
        <Pressable style={styles.iconButton} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Stay informed. Report what matters.</Text>

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

        <View style={styles.section}>
          <SectionHeader title="Recent Incidents" />
          {visible.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onPress={() => router.push(`/incident/${incident.id}`)}
            />
          ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  greeting: {
    paddingHorizontal: spacing.lg,
    fontSize: font.body,
    color: colors.textMuted,
  },
  chipsRow: {
    marginTop: spacing.lg,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
