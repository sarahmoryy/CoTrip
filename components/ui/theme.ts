// components/ui/theme.ts
// Single source of truth — import from here everywhere

export const C = {
  // Backgrounds
  bg: "#080c0a", // page background
  surface: "#111827", // cards / modals
  surfaceAlt: "#1F2937", // inputs / secondary surfaces
  border: "#1E293B", // subtle border
  borderMid: "#374151", // regular border
  borderFocus: "#4ade80", // green focus ring

  // Text
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  textDisabled: "#4B5563",

  // Brand
  green: "#4ade80", // accent — icons, active states
  greenDark: "#10B981", // buttons bg
  greenDim: "#052e16", // text on green button
  greenTint: "rgba(74,222,128,0.12)",

  // Danger
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.15)",

  // Radius
  radius: 10,
  radiusLg: 16,
  radiusXl: 20,

  // Tab bar
  tabBg: "#0d1117",
  tabBorder: "#1E293B",
  tabActive: "#4ade80",
  tabInactive: "#6B7280",
} as const;

export const FONT = {
  // Labels above inputs
  label: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.7,
    textTransform: "uppercase" as const,
  },
  // Section headers
  sectionTitle: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  // Screen title
  pageTitle: { color: C.textPrimary, fontSize: 26, fontWeight: "700" as const },
  // Body
  body: { color: C.textPrimary, fontSize: 15 },
  bodyMuted: { color: C.textSecondary, fontSize: 14 },
  // Stat number
  stat: { color: C.textPrimary, fontSize: 22, fontWeight: "700" as const },
  // Caption
  caption: { color: C.textMuted, fontSize: 12 },
} as const;
