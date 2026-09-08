import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  RefreshControl,
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
import ShareModal from "../../components/ShareModal";
import { IncidentCardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { filterCategories, Incident } from "../../data/incidents";
import {
  docToIncident,
  IncidentDoc,
  subscribeIncidents,
} from "../../services/incidents";
import { useIncidentLikes } from "../../services/likes";
import { colors, font, radius, spacing } from "../../theme";

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawIncidents, setRawIncidents] = useState<IncidentDoc[]>([]);
  const [shareIncident, setShareIncident] = useState<Incident | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    const unsub = subscribeIncidents(
      (data) => {
        setRawIncidents(data);
        setRefreshing(false);
      },
      () => setRefreshing(false)
    );
    setTimeout(() => {
      setRefreshing(false);
      unsub();
    }, 800);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeIncidents(
      (data) => {
        setRawIncidents(data);
        setLoading(false);
      },
      (error) => {
        console.warn("Explore incidents subscription error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const incidents = useMemo(() => {
    return rawIncidents.map(docToIncident);
  }, [rawIncidents]);

  const visible = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesCategory =
        selected === "All" || incident.category === selected;
      const text = `${incident.title} ${incident.location}`.toLowerCase();
      return matchesCategory && text.includes(query.trim().toLowerCase());
    });
  }, [incidents, selected, query]);

  const visibleIncidentIds = useMemo(() => visible.map((i) => i.id), [visible]);
  const { likesMap, handleToggleLike } = useIncidentLikes(
    visibleIncidentIds,
    user?.uid
  );

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
              style={styles.input}
              placeholder="Search by title, location, category..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                style={styles.clearBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={150} slideFrom={10}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsRow}
          keyboardShouldPersistTaps="handled"
        >
          {filterCategories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={selected === category}
              onPress={() => {
                Keyboard.dismiss();
                setSelected(category);
              }}
            />
          ))}
        </ScrollView>
      </FadeInView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
            {visible.map((incident, index) => {
              const likeInfo = likesMap[incident.id] || {
                count: 0,
                userLiked: false,
              };
              return (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  index={index}
                  likesCount={likeInfo.count}
                  userHasLiked={likeInfo.userLiked}
                  onLike={() => handleToggleLike(incident.id)}
                  onShare={() => setShareIncident(incident)}
                  onPress={() => router.push(`/incident/${incident.id}`)}
                />
              );
            })}
          </>
        )}
      </ScrollView>

      <ShareModal
        visible={!!shareIncident}
        incident={shareIncident}
        onClose={() => setShareIncident(null)}
      />
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
  clearBtn: {
    padding: 4,
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
