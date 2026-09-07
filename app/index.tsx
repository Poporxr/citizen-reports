import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInView from "../components/FadeInView";
import PrimaryButton from "../components/PrimaryButton";
import { colors, font, radius, shadow, spacing } from "../theme";

export default function LoginScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 12,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "-10deg", "0deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoOuter,
            {
              transform: [{ scale: logoScale }, { rotate: spin }],
            },
          ]}
        >
          <View style={styles.logoInner}>
            <Ionicons name="megaphone" size={32} color={colors.primaryText} />
          </View>
        </Animated.View>

        <FadeInView delay={300}>
          <Text style={styles.title}>Citizen Report</Text>
        </FadeInView>
        <FadeInView delay={450}>
          <Text style={styles.subtitle}>
            Report incidents around you and stay informed about what others are
            reporting nearby.
          </Text>
        </FadeInView>

        <FadeInView delay={600} style={styles.buttonWrapper}>
          <PrimaryButton
            label="Continue with Google"
            variant="outline"
            onPress={handleContinue}
            icon={<Ionicons name="logo-google" size={18} color={colors.text} />}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <PrimaryButton
            label="Get Started"
            onPress={handleContinue}
          />
        </FadeInView>
      </View>

      <FadeInView delay={800}>
        <Text style={styles.legal}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink}>Terms of Service</Text> and{" "}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </FadeInView>
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
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    ...shadow.glow,
  },
  logoInner: {
    width: 62,
    height: 62,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  buttonWrapper: {
    alignSelf: "stretch",
    marginTop: spacing.xxxl,
    gap: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: font.small,
    color: colors.textMuted,
  },
  legal: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    fontSize: font.tiny,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 17,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: "600",
  },
});
