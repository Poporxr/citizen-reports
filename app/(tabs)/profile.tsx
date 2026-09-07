import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, font, radius, spacing } from "../../theme";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();

  const menu: MenuItem[] = [
    {
      label: "My Reports",
      icon: "list-outline",
      onPress: () => router.push("/(tabs)/my-reports"),
    },
    {
      label: "Notification Settings",
      icon: "notifications-outline",
      onPress: () => {},
    },
    {
      label: "About Citizen Report",
      icon: "information-circle-outline",
      onPress: () => {},
    },
  ];

  const handleLogout = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EA</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>Emmanuel Aondohemba</Text>
            <Text style={styles.email}>emmanuel@example.com</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menu.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={[styles.menuItem, index === menu.length - 1 && styles.menuItemLast]}
            >
              <Ionicons name={item.icon} size={20} color={colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.textMuted,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
  },
  email: {
    marginTop: 2,
    fontSize: font.small,
    color: colors.textMuted,
  },
  menu: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  logoutText: {
    fontSize: font.body,
    fontWeight: "600",
    color: colors.danger,
  },
});
