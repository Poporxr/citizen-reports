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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats: StatItem[] = [
    { label: "Reports", value: "12", icon: "document-text", color: colors.primary },
    { label: "Upvotes", value: "87", icon: "heart", color: colors.danger },
    { label: "Following", value: "34", icon: "people", color: colors.success },
  ];

  const menu: MenuItem[] = [
    {
      label: "My Reports",
      subtitle: "View all submitted incidents",
      icon: "document-text",
      color: colors.primary,
      bgColor: colors.primaryLight,
      onPress: () => router.push("/(tabs)/my-reports"),
    },
    {
      label: "Notifications",
      subtitle: "Manage your alert preferences",
      icon: "notifications",
      color: colors.accent,
      bgColor: colors.accentLight,
      onPress: () => {},
    },
    {
      label: "About",
      subtitle: "Learn more about the app",
      icon: "information-circle",
      color: colors.success,
      bgColor: colors.successLight,
      onPress: () => {},
    },
  ];

  const handleLogout = () => {
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.scroll}>
          <ProfileCardSkeleton />
          {/* Menu skeleton */}
          <View style={styles.menuSkeleton}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.menuSkeletonItem}>
                <Skeleton width={36} height={36} borderRadius={radius.md} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width={100} height={14} />
                  <Skeleton width={160} height={10} />
                </View>
                <Skeleton width={18} height={18} borderRadius={9} />
              </View>
            ))}
          </View>
          {/* Logout skeleton */}
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
          <Pressable style={styles.settingsBtn} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
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
                  <Text style={styles.avatarText}>EA</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Pressable style={styles.editButton}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                Emmanuel Aondohemba
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                emmanuel@example.com
              </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={styles.statLabelRow}>
                    <Ionicons name={stat.icon} size={12} color={stat.color} />
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* ── Menu ── */}
        <FadeInView delay={200} slideFrom={15}>
          <View style={styles.menu}>
            {menu.map((item, index) => (
              <ScalePress key={item.label} onPress={item.onPress}>
                <View
                  style={[
                    styles.menuItem,
                    index < menu.length - 1 && styles.menuItemBorder,
                  ]}
                >
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
  editButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryGhost,
    alignItems: "center",
    justifyContent: "center",
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

  /* ── Stats ── */
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: font.h3,
    fontWeight: "800",
    color: colors.text,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  statLabel: {
    fontSize: font.tiny,
    fontWeight: "600",
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
