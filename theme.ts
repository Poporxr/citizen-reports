export const colors = {
  // Core surfaces
  background: "#FAFBFD",
  surface: "#F0F2F5",
  surfaceElevated: "#FFFFFF",
  border: "#E2E5EA",
  borderLight: "#EEF0F3",

  // Text
  text: "#0F1419",
  textSecondary: "#3A4250",
  textMuted: "#8892A0",

  // Primary – rich blue with tints
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",
  primaryGhost: "#EFF6FF",
  primaryText: "#FFFFFF",

  // Accent – vibrant coral/orange for CTAs and highlights
  accent: "#F97316",
  accentLight: "#FFF7ED",

  // Semantic
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ["#2563EB", "#7C3AED"] as const,
  gradientWarm: ["#F97316", "#EC4899"] as const,
  gradientDark: ["#0F172A", "#1E293B"] as const,
  gradientSurface: ["#FAFBFD", "#F0F2F5"] as const,

  // Overlay
  overlay: "rgba(15, 20, 25, 0.5)",
  overlayLight: "rgba(15, 20, 25, 0.25)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const font = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export const shadow = {
  sm: {
    shadowColor: "#0F1419",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F1419",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F1419",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
