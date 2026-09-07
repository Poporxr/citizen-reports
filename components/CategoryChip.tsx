import { Pressable, StyleSheet, Text } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function CategoryChip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      hitSlop={6}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    height: 38,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: "500",
  },
  labelSelected: {
    color: colors.primaryText,
  },
});
