import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, shadow, spacing } from "../theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "outline" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
}: Props) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primary,
        isPrimary && shadow.glow,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.label,
          isOutline && styles.labelOutline,
          isGhost && styles.labelGhost,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.sm,
  },
  ghost: {
    backgroundColor: colors.primaryGhost,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontSize: font.body,
    fontWeight: "700",
    color: colors.primaryText,
    letterSpacing: 0.3,
  },
  labelOutline: {
    color: colors.text,
    fontWeight: "600",
  },
  labelGhost: {
    color: colors.primary,
    fontWeight: "600",
  },
});
