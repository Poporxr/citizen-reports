import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
import FadeInView from "../components/FadeInView";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScalePress from "../components/ScalePress";
import { useAuth } from "../contexts/AuthContext";
import { categories, type Category } from "../data/incidents";
import { createIncident } from "../services/incidents";
import { colors, font, radius, shadow, spacing } from "../theme";

const DEFAULT_LATITUDE = 7.7322;
const DEFAULT_LONGITUDE = 8.5391;
const DEFAULT_LOCATION_NAME = "Makurdi, Benue";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Accident: "car",
  Fighting: "people",
  Rioting: "megaphone",
  Fire: "flame",
  Theft: "hand-left",
  Other: "ellipsis-horizontal-circle",
};

export default function CreateIncidentScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Location state
  const [latitude, setLatitude] = useState(DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(DEFAULT_LONGITUDE);
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION_NAME);
  const [locationLoading, setLocationLoading] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Fetch current location on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // Use default location without blocking
          if (isMounted) setLocationLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        // Attempt reverse geocoding
        try {
          const geocoded = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (isMounted && geocoded && geocoded.length > 0) {
            const place = geocoded[0];
            const city = place.city || place.subregion || place.name || "";
            const region = place.region || place.country || "";
            const readable = [city, region].filter(Boolean).join(", ");
            if (readable) {
              setLocationName(readable);
            }
          }
        } catch {
          // Non-blocking fallback
        }
      } catch (err) {
        console.warn("Location error:", err);
      } finally {
        if (isMounted) setLocationLoading(false);
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (submitted) {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 10,
          bounciness: 10,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      successScale.setValue(0);
      successOpacity.setValue(0);
    }
  }, [submitted]);

  const handlePickFromLibrary = async () => {
    setPhotoPickerOpen(false);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access media library is required to select photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setSubmitError("");
      }
    } catch (err: any) {
      console.warn("Image picker error:", err);
    }
  };

  const handleTakePhoto = async () => {
    setPhotoPickerOpen(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access camera is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setSubmitError("");
      }
    } catch (err: any) {
      console.warn("Camera error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSubmitError("Please enter an incident title.");
      return;
    }
    if (!category) {
      setSubmitError("Please select an incident category.");
      return;
    }
    if (!imageUri) {
      setSubmitError("Please add an incident photo.");
      return;
    }
    if (!user) {
      setSubmitError("You must be signed in to submit an incident.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await createIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        imageUri,
        latitude,
        longitude,
        locationName,
        userId: user.uid,
        userName: user.displayName || userProfile?.name || "Anonymous",
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit incident.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    category !== null && title.trim().length > 0 && imageUri !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <FadeInView delay={0} slideFrom={0} duration={300}>
        <View style={styles.header}>
          <ScalePress
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <View style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </View>
          </ScalePress>
          <Text style={styles.headerTitle}>Report Incident</Text>
          <View style={styles.backButton} />
        </View>
      </FadeInView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView delay={100} slideFrom={15}>
            <Text style={styles.subtitle}>
              Help others stay informed about what's happening around you.
            </Text>
          </FadeInView>

          {/* Incident Photo Selector */}
          <FadeInView delay={150} slideFrom={15}>
            {imageUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
                <Pressable
                  style={styles.changePhotoBtn}
                  onPress={() => setPhotoPickerOpen(true)}
                >
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={colors.primaryText}
                  />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </Pressable>
              </View>
            ) : (
              <ScalePress onPress={() => setPhotoPickerOpen(true)}>
                <View style={styles.photoBox}>
                  <View style={styles.photoIcon}>
                    <Ionicons name="camera" size={26} color={colors.primary} />
                  </View>
                  <Text style={styles.photoTitle}>Add incident photo</Text>
                  <Text style={styles.photoHint}>
                    Take a photo or choose from gallery
                  </Text>
                </View>
              </ScalePress>
            )}
          </FadeInView>

          {/* Category Selector */}
          <FadeInView delay={200} slideFrom={15}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.select,
                pressed && { backgroundColor: colors.surface },
              ]}
            >
              {category ? (
                <View style={styles.selectedCategory}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons
                      name={categoryIcons[category] ?? "ellipsis-horizontal-circle"}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.selectText}>{category}</Text>
                </View>
              ) : (
                <Text style={styles.selectPlaceholder}>
                  Select incident category
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </FadeInView>

          {/* Title */}
          <FadeInView delay={250} slideFrom={15}>
            <FormInput
              label="Title"
              placeholder="Incident title (e.g. Traffic accident on bypass)"
              value={title}
              onChangeText={setTitle}
            />
          </FadeInView>

          {/* Description */}
          <FadeInView delay={300} slideFrom={15}>
            <FormInput
              label="Description"
              placeholder="Describe what happened..."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </FadeInView>

          {/* Location Card */}
          <FadeInView delay={350} slideFrom={15}>
            <Text style={styles.label}>Incident Location</Text>
            <View style={[styles.locationCard, shadow.sm]}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconWrap}>
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="location"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationLoading
                    ? "Acquiring GPS location..."
                    : locationName}
                </Text>
                <View style={styles.locationLive}>
                  <View style={styles.locationLiveDot} />
                  <Text style={styles.locationLiveText}>Live</Text>
                </View>
              </View>
              <View style={styles.coordsRow}>
                <Text style={styles.coords}>
                  Lat: {latitude.toFixed(4)} • Lng: {longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </FadeInView>

          {/* Error Notice */}
          {submitError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <FadeInView delay={400} slideFrom={15}>
            <View style={styles.submit}>
              <PrimaryButton
                label={submitting ? "Uploading & Submitting..." : "Submit Incident"}
                onPress={handleSubmit}
                disabled={!canSubmit || submitting}
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
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Picker Modal */}
      <Modal visible={photoPickerOpen} transparent animationType="fade">
        <Pressable
          style={styles.backdrop}
          onPress={() => setPhotoPickerOpen(false)}
        >
          <View style={[styles.sheet, shadow.lg]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Photo</Text>

            <ScalePress onPress={handleTakePhoto}>
              <View style={[styles.option, styles.optionBorder]}>
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={20} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Take Photo with Camera</Text>
              </View>
            </ScalePress>

            <ScalePress onPress={handlePickFromLibrary}>
              <View style={styles.option}>
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={20} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Choose from Photo Library</Text>
              </View>
            </ScalePress>
          </View>
        </Pressable>
      </Modal>

      {/* Category Picker Modal */}
      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={[styles.sheet, shadow.lg]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Category</Text>
            {categories.map((item, index) => (
              <ScalePress
                key={item}
                onPress={() => {
                  setCategory(item);
                  setPickerOpen(false);
                }}
              >
                <View
                  style={[
                    styles.option,
                    index < categories.length - 1 && styles.optionBorder,
                    category === item && styles.optionSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      category === item && {
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={categoryIcons[item] ?? "ellipsis-horizontal-circle"}
                      size={18}
                      color={
                        category === item ? colors.primary : colors.textMuted
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      category === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </ScalePress>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Success Modal */}
      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.successCard,
              shadow.lg,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity,
              },
            ]}
          >
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={44}
                color={colors.success}
              />
            </View>
            <Text style={styles.successTitle}>Incident Submitted!</Text>
            <Text style={styles.successText}>
              Thanks for reporting. Your incident will appear in the realtime
              feed and My Reports to keep your community informed.
            </Text>
            <View style={styles.successAction}>
              <PrimaryButton
                label="Back to Feed"
                onPress={() => {
                  setSubmitted(false);
                  router.replace("/(tabs)/home");
                }}
              />
            </View>
          </Animated.View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  headerTitle: {
    fontSize: font.h3,
    fontWeight: "700",
    color: colors.text,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    fontSize: font.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  photoBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primaryLight,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryGhost,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  photoPreviewWrapper: {
    position: "relative",
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: radius.xl,
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  changePhotoText: {
    color: colors.primaryText,
    fontSize: font.small,
    fontWeight: "600",
  },
  photoIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  photoTitle: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.text,
  },
  photoHint: {
    marginTop: 4,
    fontSize: font.small,
    color: colors.textMuted,
  },
  label: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryGhost,
    alignItems: "center",
    justifyContent: "center",
  },
  selectText: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: "500",
  },
  selectPlaceholder: {
    fontSize: font.body,
    color: colors.textMuted,
  },
  locationCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    fontWeight: "600",
  },
  locationLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  locationLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  locationLiveText: {
    fontSize: font.tiny,
    fontWeight: "700",
    color: colors.success,
  },
  coordsRow: {
    marginTop: spacing.sm,
    paddingLeft: 34 + spacing.sm,
  },
  coords: {
    fontSize: font.small,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: font.small,
    color: colors.danger,
    fontWeight: "500",
  },
  submit: {
    marginTop: spacing.xl,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xxl,
    padding: spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: {
    backgroundColor: colors.primaryGhost,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  successCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: font.h2,
    fontWeight: "800",
    color: colors.text,
  },
  successText: {
    marginTop: spacing.sm,
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  successAction: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
  },
});
