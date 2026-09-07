import { StyleSheet, Text, View } from "react-native";
import { colors, font, spacing } from "../theme";

type Props = {
  title: string;
  action?: string;
};

export default function SectionHeader({ title, action }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.h3,
    fontWeight: "600",
    color: colors.text,
  },
  action: {
    fontSize: font.small,
    color: colors.textMuted,
  },
});
