import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChip from "../../components/CategoryChip";
import EmptyState from "../../components/EmptyState";
import IncidentCard from "../../components/IncidentCard";
import { filterCategories, incidents } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("All");

  const visible = incidents.filter((incident) => {
    const matchesCategory = selected === "All" || incident.category === selected;
    const text = `${incident.title} ${incident.location}`.toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Incidents</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search incidents"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
        </View>
        <Pressable style={styles.filterButton} accessibilityLabel="Filters">
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

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

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No incidents found"
            message="Try a different search or category filter."
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: {
    marginTop: spacing.lg,
    flexGrow: 0,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
