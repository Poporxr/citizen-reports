import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";
import { colors, radius } from "../theme";

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * Skeleton shimmer placeholder.
 * Uses a looping opacity pulse to indicate loading.
 */
export default function Skeleton({
  width = "100%",
  height = 16,
  borderRadius: br = radius.sm,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bone,
        {
          width: width as number,
          height,
          borderRadius: br,
          opacity,
        },
        style,
      ]}
    />
  );
}

/* ── Pre-built skeleton layouts ── */

export function IncidentCardSkeleton() {
  return (
    <Animated.View style={skeletonStyles.card}>
      {/* Avatar */}
      <Skeleton width={40} height={40} borderRadius={20} />
      {/* Content */}
      <Animated.View style={skeletonStyles.cardContent}>
        {/* Name row */}
        <Animated.View style={skeletonStyles.row}>
          <Skeleton width={120} height={14} />
          <Skeleton width={50} height={12} />
        </Animated.View>
        {/* Pills row */}
        <Animated.View style={skeletonStyles.row}>
          <Skeleton width={90} height={18} borderRadius={999} />
          <Skeleton width={60} height={18} borderRadius={999} />
        </Animated.View>
        {/* Title */}
        <Skeleton width="85%" height={14} style={{ marginTop: 4 }} />
        {/* Description lines */}
        <Skeleton width="100%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="70%" height={12} style={{ marginTop: 4 }} />
        {/* Image placeholder */}
        <Skeleton
          width="100%"
          height={140}
          borderRadius={radius.md}
          style={{ marginTop: 10 }}
        />
        {/* Action row */}
        <Animated.View style={[skeletonStyles.row, { marginTop: 10 }]}>
          <Skeleton width={40} height={14} />
          <Skeleton width={40} height={14} />
          <Skeleton width={24} height={14} />
          <Skeleton width={24} height={14} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export function ProfileCardSkeleton() {
  return (
    <Animated.View style={skeletonStyles.profileCard}>
      <Animated.View style={skeletonStyles.profileTop}>
        <Skeleton width={56} height={56} borderRadius={999} />
        <Skeleton width={36} height={36} borderRadius={radius.md} />
      </Animated.View>
      <Skeleton width={180} height={16} style={{ marginTop: 12 }} />
      <Skeleton width={140} height={12} style={{ marginTop: 6 }} />
      {/* Stats */}
      <Animated.View style={[skeletonStyles.row, { marginTop: 16, justifyContent: "space-around" }]}>
        <Animated.View style={{ alignItems: "center", gap: 4 }}>
          <Skeleton width={30} height={18} />
          <Skeleton width={50} height={10} />
        </Animated.View>
        <Animated.View style={{ alignItems: "center", gap: 4 }}>
          <Skeleton width={30} height={18} />
          <Skeleton width={50} height={10} />
        </Animated.View>
        <Animated.View style={{ alignItems: "center", gap: 4 }}>
          <Skeleton width={30} height={18} />
          <Skeleton width={50} height={10} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export function DetailSkeleton() {
  return (
    <Animated.View style={skeletonStyles.detailWrap}>
      {/* Reporter row */}
      <Animated.View style={[skeletonStyles.row, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Skeleton width={42} height={42} borderRadius={21} />
        <Animated.View style={{ flex: 1, marginLeft: 10, gap: 4 }}>
          <Skeleton width={130} height={14} />
          <Skeleton width={70} height={10} />
        </Animated.View>
        <Skeleton width={70} height={30} borderRadius={999} />
      </Animated.View>
      {/* Title */}
      <Animated.View style={{ paddingHorizontal: 16, gap: 6 }}>
        <Skeleton width="90%" height={18} />
        <Skeleton width="60%" height={18} />
      </Animated.View>
      {/* Image */}
      <Skeleton
        width="100%"
        height={200}
        borderRadius={radius.lg}
        style={{ marginTop: 12, paddingHorizontal: 16 }}
      />
      {/* Location card */}
      <Skeleton
        width="100%"
        height={60}
        borderRadius={radius.md}
        style={{ marginTop: 12 }}
      />
      {/* Engagement */}
      <Animated.View style={[skeletonStyles.row, { marginTop: 12, paddingHorizontal: 16 }]}>
        <Skeleton width={50} height={16} />
        <Skeleton width={50} height={16} />
        <Skeleton width={50} height={16} />
      </Animated.View>
      {/* Description */}
      <Animated.View style={{ paddingHorizontal: 16, marginTop: 16, gap: 6 }}>
        <Skeleton width={100} height={12} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="75%" height={12} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.border,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  cardContent: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileCard: {
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
  },
  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailWrap: {
    paddingTop: 4,
  },
});
