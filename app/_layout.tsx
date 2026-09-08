import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { colors } from "../theme";

function NavigationRoot() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if the current route is the auth screen ("/" or "index")
    const firstSegment = (segments as string[])[0];
    const inAuthScreen = !firstSegment || firstSegment === "index";

    if (!user && !inAuthScreen) {
      // Unauthenticated user attempting to access protected screens
      router.replace("/");
    } else if (user && inAuthScreen) {
      // Authenticated user on auth screen, redirect to home
      router.replace("/(tabs)/home");
    }
  }, [user, loading, segments]);

  return (
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
  );
}

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
      <AuthProvider>
        <NavigationRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
