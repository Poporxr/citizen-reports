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
import EmptyState from "../../components/EmptyState";
import FadeInView from "../../components/FadeInView";
import IncidentCard from "../../components/IncidentCard";
import { IncidentCardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import {
  docToIncident,
  IncidentDoc,
  subscribeMyReports,
} from "../../services/incidents";
import { colors, font, radius, shadow, spacing } from "../../theme";

const segments = ["All", "Active", "Resolved"] as const;

export default function MyReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [segment, setSegment] = useState<(typeof segments)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawReports, setRawReports] = useState<IncidentDoc[]>([]);

  const onRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    const unsub = subscribeMyReports(
      user.uid,
      (data) => {
        setRawReports(data);
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
    if (!user) {
      setRawReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMyReports(
      user.uid,
      (data) => {
        setRawReports(data);
        setLoading(false);
      },
      (error) => {
        console.warn("My reports error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const reports = useMemo(() => {
    return rawReports.map(docToIncident);
  }, [rawReports]);

  const visible = useMemo(() => {
    if (segment === "All") return reports;
    if (segment === "Active") return reports.filter((r) => r.active);
    return reports.filter((r) => !r.active);
  }, [segment, reports]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FadeInView delay={0} slideFrom={0} duration={400}>
        <View style={styles.header}>
          <Text style={styles.title}>My Reports</Text>
          <Text style={styles.subtitle}>
            {reports.length} incident{reports.length !== 1 ? "s" : ""} submitted
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={100} slideFrom={10}>
        <View style={styles.segmented}>
          {segments.map((item) => {
            const active = segment === item;
            return (
              <Pressable
                key={item}
                onPress={() => setSegment(item)}
                style={[
                  styles.segment,
                  active && styles.segmentActive,
                  active && shadow.sm,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FadeInView>

      <ScrollView
        contentContainerStyle={styles.list}
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
          <View>
            <IncidentCardSkeleton />
            <IncidentCardSkeleton />
          </View>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No reports yet"
            message={
              segment === "All"
                ? "When you report an incident, it'll appear here."
                : `No ${segment.toLowerCase()} reports found.`
            }
            actionLabel="Report an Incident"
            onAction={() => router.push("/create")}
          />
        ) : (
          visible.map((incident, index) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              index={index}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
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
  segmented: {
    flexDirection: "row",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
  },
  segment: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.surfaceElevated,
  },
  segmentText: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  list: {
    paddingBottom: spacing.xxxl,
  },
});
