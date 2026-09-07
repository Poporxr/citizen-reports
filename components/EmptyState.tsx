import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import PrimaryButton from "./PrimaryButton";
import { colors, font, radius, spacing } from "../theme";

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
    <FadeInView style={styles.wrapper}>
      <View style={styles.iconCircle}>
        <View style={styles.iconInner}>
          <Ionicons name={icon} size={28} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryGhost,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  iconInner: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: font.h3,
    fontWeight: "700",
    color: colors.text,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: "stretch",
  },
});
