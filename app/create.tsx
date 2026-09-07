import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import { categories, type Category } from "../data/incidents";
import { colors, font, radius, spacing } from "../theme";

const MOCK_LATITUDE = 7.7322;
const MOCK_LONGITUDE = 8.5391;

export default function CreateIncidentScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlePickPhoto = () => {
    // Placeholder: image picking will be added later.
  };

  const handleSubmit = () => {
    // Placeholder: submission will be added later.
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Help others stay informed about what's happening around you.
          </Text>

          <Pressable onPress={handlePickPhoto} style={styles.photoBox}>
            <View style={styles.photoIcon}>
              <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
            </View>
            <Text style={styles.photoTitle}>Add incident photo</Text>
            <Text style={styles.photoHint}>Take a photo or choose from gallery</Text>
          </Pressable>

          <Text style={styles.label}>Category</Text>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.select}>
            <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
              {category ?? "Select incident category"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </Pressable>

          <FormInput
            label="Title"
            placeholder="Incident title"
            value={title}
            onChangeText={setTitle}
          />

          <FormInput
            label="Description"
            placeholder="Describe what happened..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Incident Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.locationText}>Use current location</Text>
            </View>
            <Text style={styles.coords}>Latitude: {MOCK_LATITUDE}</Text>
            <Text style={styles.coords}>Longitude: {MOCK_LONGITUDE}</Text>
          </View>

          <View style={styles.submit}>
            <PrimaryButton label="Submit Incident" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select incident category</Text>
            {categories.map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setCategory(item);
                  setPickerOpen(false);
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{item}</Text>
                {category === item ? (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={26} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Incident submitted</Text>
            <Text style={styles.successText}>
              Thanks for reporting. Your incident will appear in My Reports.
            </Text>
            <View style={styles.successAction}>
              <PrimaryButton
                label="Back to Home"
                onPress={() => {
                  setSubmitted(false);
                  router.replace("/(tabs)/home");
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  photoBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  photoIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  photoTitle: {
    fontSize: font.body,
    fontWeight: "600",
    color: colors.text,
  },
  photoHint: {
    marginTop: 2,
    fontSize: font.small,
    color: colors.textMuted,
  },
  label: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  selectText: {
    fontSize: font.body,
    color: colors.text,
  },
  selectPlaceholder: {
    color: colors.textMuted,
  },
  locationCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: "500",
  },
  coords: {
    fontSize: font.tiny,
    color: colors.textMuted,
    lineHeight: 17,
  },
  submit: {
    marginTop: spacing.xl,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,20,24,0.35)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  optionText: {
    fontSize: font.body,
    color: colors.text,
  },
  successCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
  },
  successText: {
    marginTop: spacing.sm,
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  successAction: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
  },
});
