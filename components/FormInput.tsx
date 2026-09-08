import { forwardRef, useState } from "react";
import {
  ReturnKeyTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
};

const FormInput = forwardRef<TextInput, Props>(function FormInput(
  {
    label,
    placeholder,
    value,
    onChangeText,
    multiline = false,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    autoCorrect = true,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
        ]}
      />
    </View>
  );
});

export default FormInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
  },
  multiline: {
    minHeight: 130,
    paddingTop: spacing.lg,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
});
