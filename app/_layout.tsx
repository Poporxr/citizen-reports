import { Stack } from "expo-router";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {Platform.OS === "android" && (
        <RNStatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
            // Global top padding for Android to account for translucent status bar
            ...(Platform.OS === "android"
              ? { paddingTop: RNStatusBar.currentHeight ?? 0 }
              : {}),
          },
        }}
      />
    </SafeAreaProvider>
  );
}
