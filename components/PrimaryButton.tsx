import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  icon?: React.ReactNode;
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
}: Props) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outline : styles.primary,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, isOutline && styles.labelOutline]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontSize: font.body,
    fontWeight: "600",
    color: colors.primaryText,
  },
  labelOutline: {
    color: colors.text,
  },
});
