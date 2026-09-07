import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, spacing } from "../theme";

const tabs: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "home", label: "Home", icon: "home-outline" },
  { name: "explore", label: "Explore", icon: "search-outline" },
  { name: "my-reports", label: "My Reports", icon: "list-outline" },
  { name: "profile", label: "Profile", icon: "person-outline" },
];

export default function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  const renderTab = (tab: (typeof tabs)[number]) => {
    const focused = activeName === tab.name;
    return (
      <Pressable
        key={tab.name}
        onPress={() => navigation.navigate(tab.name)}
        style={styles.tab}
      >
        <Ionicons
          name={tab.icon}
          size={22}
          color={focused ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.row}>
        {left.map(renderTab)}
        <View style={styles.centerSlot}>
          <Pressable
            onPress={() => router.push("/create")}
            style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}
            accessibilityLabel="Report incident"
          >
            <Ionicons name="add" size={28} color={colors.primaryText} />
          </Pressable>
        </View>
        {right.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    gap: 2,
  },
  tabLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
  },
  reportButton: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    borderWidth: 4,
    borderColor: colors.background,
  },
  pressed: {
    opacity: 0.85,
  },
});
