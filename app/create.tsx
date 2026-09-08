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
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
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
import ScalePress from "../components/ScalePress";
import { useAuth } from "../contexts/AuthContext";
import { categories, type Category } from "../data/incidents";
import { createIncident } from "../services/incidents";
import { colors, font, radius, shadow, spacing } from "../theme";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Accident: "car",
  Fighting: "people",
  Rioting: "megaphone",
  Fire: "flame",
  Theft: "hand-left",
  Other: "ellipsis-horizontal-circle",
};

function formatLocationName(place: Location.LocationGeocodedAddress): string | null {
  const city = place.city || place.district || place.subregion || place.name;
  const region = place.region
    ? place.region.endsWith("State")
      ? place.region
      : `${place.region} State`
    : null;
  const country = place.country;

  return [city, region || country].filter(Boolean).join(", ") || null;
}

const openAppSettings = () => {
  void Linking.openSettings();
};

function showPermissionSettingsAlert(title: string, message: string) {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: openAppSettings },
  ]);
}

export default function CreateIncidentScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const descriptionRef = useRef<TextInput>(null);

  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationUnavailable, setLocationUnavailable] = useState(false);

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
      setLocationUnavailable(false);
      try {
        const currentPermission = await Location.getForegroundPermissionsAsync();
        const permission = currentPermission.granted
          ? currentPermission
          : await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          if (isMounted) {
            setLatitude(null);
            setLongitude(null);
            setLocationName(null);
            setLocationUnavailable(true);
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationName(null);

        // Attempt reverse geocoding
        try {
          const geocoded = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (isMounted && geocoded && geocoded.length > 0) {
            setLocationName(formatLocationName(geocoded[0]));
          }
        } catch {
          // Non-blocking fallback
        }
      } catch (err) {
        console.warn("Location error:", err);
        if (isMounted) {
          setLatitude(null);
          setLongitude(null);
          setLocationName(null);
          setLocationUnavailable(true);
        }
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
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showPermissionSettingsAlert(
          "Photo Access Needed",
          "Citizen Report needs photo access so you can attach an incident picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        ...(Platform.OS === "android" ? { defaultTab: "photos" as const } : null),
        ...(Platform.OS === "ios"
          ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC }
          : null),
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setSubmitError("");
      }
    } catch (err: any) {
      console.warn("Image picker error:", err);
      Alert.alert(
        "Unable to Open Photos",
        "Please check your device settings to allow photo access."
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showPermissionSettingsAlert(
          "Camera Access Needed",
          "Citizen Report needs camera access so you can take an incident picture."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        ...(Platform.OS === "ios"
          ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC }
          : null),
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setSubmitError("");
      }
    } catch (err: any) {
      console.warn("Camera error:", err);
      Alert.alert(
        "Unable to Open Camera",
        "Please check your device settings to allow camera access."
      );
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
  const hasCoordinates = latitude !== null && longitude !== null;
  const displayedLocation = locationLoading
    ? "Detecting location..."
    : locationName || (hasCoordinates ? "Current location detected" : "Location unavailable");
  const displayedCoordinates = hasCoordinates
    ? `Lat: ${latitude.toFixed(4)} • Lng: ${longitude.toFixed(4)}`
    : locationUnavailable
      ? "Permission denied or location unavailable"
      : "Coordinates not detected yet";

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
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <FadeInView delay={100} slideFrom={15}>
              <Text style={styles.subtitle}>
                Help others stay informed about what's happening around you.
              </Text>
            </FadeInView>

            {/* Incident Photo Selector */}
            <FadeInView delay={150} slideFrom={15}>
              <View style={styles.photoArea}>
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoEmptyState}>
                    <View style={styles.photoIcon}>
                      <Ionicons name="camera" size={26} color={colors.primary} />
                    </View>
                    <Text style={styles.photoTitle}>Add incident photo</Text>
                    <Text style={styles.photoHint}>
                      Take a photo or choose from gallery
                    </Text>
                  </View>
                )}

                <View style={styles.photoActionRow}>
                  <ScalePress
                    onPress={() => {
                      Keyboard.dismiss();
                      void handleTakePhoto();
                    }}
                    accessibilityLabel="Take photo"
                  >
                    <View style={styles.photoActionButton}>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                  </ScalePress>

                  <ScalePress
                    onPress={() => {
                      Keyboard.dismiss();
                      void handlePickFromLibrary();
                    }}
                    accessibilityLabel="Choose photo from library"
                  >
                    <View style={styles.photoActionButton}>
                      <Ionicons
                        name="images-outline"
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                  </ScalePress>
                </View>
              </View>
            </FadeInView>

            {/* Category Selector */}
            <FadeInView delay={200} slideFrom={15}>
              <Text style={styles.label}>Category</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setPickerOpen(true);
                }}
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
                returnKeyType="next"
                onSubmitEditing={() => descriptionRef.current?.focus()}
              />
            </FadeInView>

            {/* Description */}
            <FadeInView delay={300} slideFrom={15}>
              <FormInput
                ref={descriptionRef}
                label="Description"
                placeholder="Describe what happened..."
                value={description}
                onChangeText={setDescription}
                multiline
                blurOnSubmit={false}
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
                  {displayedLocation}
                </Text>
                <View
                  style={[
                    styles.locationLive,
                    !hasCoordinates && styles.locationUnavailable,
                  ]}
                >
                  <View style={styles.locationLiveDot} />
                  <Text style={styles.locationLiveText}>
                    {hasCoordinates ? "Live" : "Off"}
                  </Text>
                </View>
              </View>
              <View style={styles.coordsRow}>
                <Text style={styles.coords}>
                  {displayedCoordinates}
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
  photoArea: {
    minHeight: 220,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primaryLight,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryGhost,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  photoEmptyState: {
    flex: 1,
    minHeight: 160,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreview: {
    width: "100%",
    height: 172,
    backgroundColor: colors.surface,
  },
  photoActionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
  },
  photoActionButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryGhost,
    alignItems: "center",
    justifyContent: "center",
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
  locationUnavailable: {
    backgroundColor: colors.surface,
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
