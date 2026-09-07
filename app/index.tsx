import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import { colors, font, radius, spacing } from "../theme";

export default function LoginScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons name="megaphone-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Welcome to Citizen Report</Text>
        <Text style={styles.subtitle}>
          Report incidents around you and stay informed about what others are
          reporting nearby.
        </Text>
        <View style={styles.button}>
          <PrimaryButton
            label="Continue with Google"
            variant="outline"
            onPress={handleContinue}
            icon={<Ionicons name="logo-google" size={18} color={colors.text} />}
          />
        </View>
      </View>
      <Text style={styles.legal}>
        By continuing you agree to our Terms of Service and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: font.h1,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    alignSelf: "stretch",
    marginTop: spacing.xxl,
  },
  legal: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    fontSize: font.tiny,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 17,
  },
});
