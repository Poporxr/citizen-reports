import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type { Incident } from "../data/incidents";
import { colors, font, radius, spacing } from "../theme";

interface ShareModalProps {
  visible: boolean;
  incident: Incident | null;
  onClose: () => void;
}

export default function ShareModal({
  visible,
  incident,
  onClose,
}: ShareModalProps) {
  if (!incident) return null;

  const handleNativeShare = async () => {
    onClose();
    try {
      const message = `🚨 [Citizen Report] ${incident.title}\nCategory: ${incident.category}\nLocation: ${incident.location}\nTime: ${incident.time}\n\n${incident.description}`;
      await Share.share({
        title: incident.title,
        message,
      });
    } catch (error) {
      console.warn("Error sharing incident:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.indicator} />

              <Text style={styles.sheetTitle}>Share Report</Text>
              <Text style={styles.incidentTitle} numberOfLines={1}>
                {incident.title}
              </Text>
              <Text style={styles.incidentSub}>
                {incident.category} • {incident.location}
              </Text>

              <View style={styles.divider} />

              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionPressed,
                ]}
                onPress={handleNativeShare}
              >
                <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons
                    name="share-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>Share with others</Text>
                  <Text style={styles.optionDesc}>
                    Send via Messages, WhatsApp, social apps, or copy link
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.cancelBtnPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  indicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: font.h3,
    fontWeight: "700",
    color: colors.text,
  },
  incidentTitle: {
    fontSize: font.small,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 4,
  },
  incidentSub: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionPressed: {
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: font.body,
    fontWeight: "600",
    color: colors.text,
  },
  optionDesc: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnPressed: {
    opacity: 0.8,
  },
  cancelText: {
    fontSize: font.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
