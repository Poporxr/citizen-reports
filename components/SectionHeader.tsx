import { StyleSheet, Text, View } from "react-native";
import { colors, font, spacing } from "../theme";

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export default function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? (
        <Text style={styles.action} onPress={onAction}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: font.h3,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.1,
  },
  action: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: "600",
  },
});
