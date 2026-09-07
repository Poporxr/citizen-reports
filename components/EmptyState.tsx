import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";
import PrimaryButton from "./PrimaryButton";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon = "document-text-outline",
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: "stretch",
  },
});
