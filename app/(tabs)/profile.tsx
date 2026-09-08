import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInView from "../../components/FadeInView";
import ScalePress from "../../components/ScalePress";
import Skeleton, { ProfileCardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeMyReports } from "../../services/incidents";
import { colors, font, radius, shadow, spacing } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 360;

type MenuItem = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
};

type StatItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportsCount, setReportsCount] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyReports(
      user.uid,
      (reports) => {
        setReportsCount(reports.length);
      },
      () => {}
    );
    return () => unsub();
  }, [user]);

  const displayName =
    user?.displayName || userProfile?.name || "Citizen Reporter";
  const displayEmail = user?.email || "No email available";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CR";

  const menu: MenuItem[] = [
    {
      label: "My Reports",
      subtitle: "View all submitted incidents",
      icon: "document-text",
      color: colors.primary,
      bgColor: colors.primaryLight,
      onPress: () => router.push("/(tabs)/my-reports"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.warn("Logout error:", err);
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.scroll}>
          <ProfileCardSkeleton />
          <Skeleton
            width="100%"
            height={50}
            borderRadius={radius.xl}
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FadeInView delay={0} slideFrom={0} duration={400}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
      </FadeInView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Card ── */}
        <FadeInView delay={100} slideFrom={15}>
          <View style={[styles.userCard, shadow.md]}>
            <View style={styles.userTopRow}>
              <View style={styles.avatarOuter}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Ionicons
                    name="document-text"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.badgeText}>
                    {reportsCount} {reportsCount === 1 ? "Report" : "Reports"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                {displayName}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {displayEmail}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* ── Menu ── */}
        <FadeInView delay={200} slideFrom={15}>
          <View style={styles.menu}>
            {menu.map((item) => (
              <ScalePress key={item.label} onPress={item.onPress}>
                <View style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuTextGroup}>
                    <Text style={styles.menuLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </ScalePress>
            ))}
          </View>
        </FadeInView>

        {/* ── Logout ── */}
        <FadeInView delay={300} slideFrom={15}>
          <ScalePress onPress={handleLogout}>
            <View style={styles.logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </ScalePress>
        </FadeInView>

        <FadeInView delay={400} slideFrom={10}>
          <Text style={styles.version}>Citizen Report v1.0.0</Text>
        </FadeInView>
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
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  /* ── Skeleton states ── */
  menuSkeleton: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    overflow: "hidden",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  menuSkeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  /* ── User Card ── */
  userCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    marginTop: spacing.sm,
  },
  userTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  avatarOuter: {
    position: "relative",
  },
  avatar: {
    width: isSmallScreen ? 48 : 56,
    height: isSmallScreen ? 48 : 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: isSmallScreen ? font.body : font.h3,
    fontWeight: "800",
    color: colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.surfaceElevated,
  },
  badgeContainer: {
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: font.small - 1,
    fontWeight: "700",
    color: colors.primary,
  },
  userInfo: {
    marginTop: spacing.md,
  },
  name: {
    fontSize: isSmallScreen ? font.body + 1 : font.h3,
    fontWeight: "700",
    color: colors.text,
  },
  email: {
    marginTop: 2,
    fontSize: font.small,
    color: colors.textMuted,
  },

  /* ── Menu ── */
  menu: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadow.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextGroup: {
    flex: 1,
  },
  menuLabel: {
    fontSize: font.body,
    fontWeight: "600",
    color: colors.text,
  },
  menuSubtitle: {
    marginTop: 1,
    fontSize: font.tiny,
    color: colors.textMuted,
  },

  /* ── Logout ── */
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    minHeight: 50,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.xl,
    ...shadow.sm,
  },
  logoutText: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.danger,
  },
  version: {
    marginTop: spacing.xl,
    fontSize: font.tiny,
    color: colors.textMuted,
    textAlign: "center",
  },
});
