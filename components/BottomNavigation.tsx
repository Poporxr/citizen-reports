import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, shadow, spacing } from "../theme";

const tabs: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "home", label: "Home", icon: "home-outline", iconFilled: "home" },
  { name: "explore", label: "Explore", icon: "compass-outline", iconFilled: "compass" },
  { name: "my-reports", label: "Reports", icon: "document-text-outline", iconFilled: "document-text" },
  { name: "profile", label: "Profile", icon: "person-outline", iconFilled: "person" },
];

export default function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, []);

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabRotation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fabRotation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    router.push("/create");
  };

  const spin = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const renderTab = (tab: (typeof tabs)[number]) => {
    const focused = activeName === tab.name;
    return (
      <Pressable
        key={tab.name}
        onPress={() => navigation.navigate(tab.name)}
        style={styles.tab}
      >
        <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
        <Ionicons
          name={focused ? tab.iconFilled : tab.icon}
          size={22}
          color={focused ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            focused && styles.tabLabelActive,
          ]}
        >
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
          <Animated.View
            style={[
              styles.fabShadow,
              { transform: [{ scale: fabScale }] },
            ]}
          >
            <Pressable
              onPress={handleFabPress}
              style={({ pressed }) => [
                styles.reportButton,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Report incident"
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="add" size={28} color={colors.primaryText} />
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>
        {right.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceElevated,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    gap: 3,
  },
  tabIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  tabIndicatorActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
  },
  fabShadow: {
    marginTop: -32,
    ...shadow.glow,
  },
  reportButton: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surfaceElevated,
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
});
