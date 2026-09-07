import { Pressable, StyleSheet, Text } from "react-native";
import { colors, font, radius } from "../theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function CategoryChip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: font.tiny + 1,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  labelSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
