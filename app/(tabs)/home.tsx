import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChip from "../../components/CategoryChip";
import EmptyState from "../../components/EmptyState";
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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>("All");
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
        console.warn("Realtime incidents subscription error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const incidents = useMemo(() => {
    return rawIncidents.map(docToIncident);
  }, [rawIncidents]);

  const visible = useMemo(() => {
    if (selected === "All") return incidents;
    return incidents.filter((incident) => incident.category === selected);
  }, [selected, incidents]);

  const visibleIncidentIds = useMemo(() => visible.map((i) => i.id), [visible]);
  const { likesMap, handleToggleLike } = useIncidentLikes(
    visibleIncidentIds,
    user?.uid
  );

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
          <View style={styles.feedContainer}>
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
          </View>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="No reports found"
            message={
              selected === "All"
                ? "No incidents have been reported yet. Keep your neighborhood safe by reporting first."
                : `No reports found under the category "${selected}".`
            }
            actionLabel="Report an Incident"
            onAction={() => router.push("/create")}
          />
        ) : (
          <View style={styles.feedContainer}>
            {visible.map((incident, index) => {
              const likeInfo = likesMap[incident.id] || {
                count: 0,
                userLiked: false,
              };
              const rawDoc = rawIncidents.find((r) => r.id === incident.id);
              return (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  index={index}
                  likesCount={likeInfo.count}
                  commentsCount={rawDoc?.commentsCount ?? 0}
                  userHasLiked={likeInfo.userLiked}
                  onLike={() => handleToggleLike(incident.id)}
                  onShare={() => setShareIncident(incident)}
                  onPress={() => router.push(`/incident/${incident.id}`)}
                />
              );
            })}
          </View>
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
