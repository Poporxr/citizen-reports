import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInView from "../components/FadeInView";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { formatAuthError } from "../services/auth";
import { colors, font, radius, shadow, spacing } from "../theme";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

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

  const spin = logoRotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "-10deg", "0deg"],
  });

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    if (isRegister && !name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
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

              <FadeInView delay={200}>
                <Text style={styles.title}>Citizen Report</Text>
              </FadeInView>
              <FadeInView delay={300}>
                <Text style={styles.subtitle}>
                  {isRegister
                    ? "Create an account to report incidents and help keep your community safe."
                    : "Sign in to report incidents and stay informed about what's happening nearby."}
                </Text>
              </FadeInView>

              {/* Mode Switcher */}
              <FadeInView delay={400} style={styles.modeSwitchWrapper}>
                <View style={styles.modeSwitch}>
                  <Pressable
                    style={[
                      styles.modeButton,
                      !isRegister && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setIsRegister(false);
                      setErrorMessage("");
                    }}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        !isRegister && styles.modeButtonTextActive,
                      ]}
                    >
                      Sign In
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modeButton,
                      isRegister && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setIsRegister(true);
                      setErrorMessage("");
                    }}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        isRegister && styles.modeButtonTextActive,
                      ]}
                    >
                      Register
                    </Text>
                  </Pressable>
                </View>
              </FadeInView>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <FadeInView delay={500} style={styles.form}>
                {isRegister && (
                  <FormInput
                    label="Full Name"
                    placeholder="e.g. Emmanuel Aondohemba"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                )}

                <FormInput
                  ref={emailInputRef}
                  label="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />

                <FormInput
                  ref={passwordInputRef}
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

              <View style={styles.actionContainer}>
                <PrimaryButton
                  label={
                    submitting
                      ? isRegister
                        ? "Creating Account..."
                        : "Signing In..."
                      : isRegister
                      ? "Create Account"
                      : "Sign In"
                  }
                  onPress={handleSubmit}
                  disabled={submitting}
                  icon={
                    submitting ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primaryText}
                      />
                    ) : undefined
                  }
                />
              </View>

              <Pressable
                style={styles.toggleRow}
                onPress={() => {
                  setIsRegister((prev) => !prev);
                  setErrorMessage("");
                }}
              >
                <Text style={styles.toggleText}>
                  {isRegister
                    ? "Already have an account? "
                    : "Don't have an account? "}
                  <Text style={styles.toggleLink}>
                    {isRegister ? "Sign In" : "Register"}
                  </Text>
                </Text>
              </Pressable>
            </FadeInView>
          </View>

          <FadeInView delay={700}>
            <Text style={styles.legal}>
              By continuing you agree to our{" "}
              <Text style={styles.legalLink}>Terms of Service</Text> and{" "}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadow.glow,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  modeSwitchWrapper: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceElevated,
    ...shadow.sm,
  },
  modeButtonText: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    alignSelf: "stretch",
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: font.small,
    color: colors.danger,
    fontWeight: "500",
  },
  form: {
    alignSelf: "stretch",
    width: "100%",
  },
  actionContainer: {
    marginTop: spacing.sm,
  },
  toggleRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  toggleLink: {
    color: colors.primary,
    fontWeight: "700",
  },
  legal: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
