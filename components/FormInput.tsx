import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
};

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  multiline: {
    minHeight: 130,
  },
});
