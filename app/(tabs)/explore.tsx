import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import FadeInView from "../../components/FadeInView";
import IncidentCard from "../../components/IncidentCard";
import { IncidentCardSkeleton } from "../../components/Skeleton";
import { filterCategories, incidents } from "../../data/incidents";
import { colors, font, radius, spacing } from "../../theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const visible = incidents.filter((incident) => {
    const matchesCategory = selected === "All" || incident.category === selected;
    const text = `${incident.title} ${incident.location}`.toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FadeInView delay={0} slideFrom={0} duration={400}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            {incidents.length} incidents reported nearby
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={100} slideFrom={10}>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              searchFocused && styles.searchBoxFocused,
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={searchFocused ? colors.primary : colors.textMuted}
            />
            <TextInput
              placeholder="Search by title, location..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.input}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.filterButton,
              pressed && { backgroundColor: colors.surface },
            ]}
            accessibilityLabel="Filters"
          >
            <Ionicons name="options" size={20} color={colors.text} />
          </Pressable>
        </View>
      </FadeInView>

      <FadeInView delay={200} slideFrom={8}>
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
      </FadeInView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <>
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
          </>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No incidents found"
            message="Try a different search or category filter."
          />
        ) : (
          <>
            <Text style={styles.resultCount}>
              {visible.length} result{visible.length !== 1 ? "s" : ""}
            </Text>
            {visible.map((incident, index) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                index={index}
                onPress={() => router.push(`/incident/${incident.id}`)}
              />
            ))}
          </>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: font.h1,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    fontSize: font.small,
    color: colors.textMuted,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  searchBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  input: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xxxl,
  },
  resultCount: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: "500",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
