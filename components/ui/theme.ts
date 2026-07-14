// components/ui/theme.ts
// Light + dark palettes, swapped via the useTheme() hook.
// Static `C` and `FONT` exports default to dark for backward compatibility
// (and for any code that needs theme values at module scope), but
// runtime-reactive switching requires components to use useTheme().

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

// ─── Palettes ────────────────────────────────────────────────────────────────

type PaletteShape = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceHi: string;
  border: string;
  borderMid: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  green: string;
  greenDark: string;
  greenDim: string;
  greenTint: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;
  highlight: string;
  red: string;
  redDim: string;
  radius: number;
  radiusLg: number;
  radiusXl: number;
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
};

const dark: PaletteShape = {
  // Backgrounds — neutral, no blue/green tint
  bg: "#000000",
  surface: "#141414",
  surfaceAlt: "#1F1F1F",
  surfaceHi: "#262626",
  border: "#1F1F1F",
  borderMid: "#2E2E2E",
  borderFocus: "#FFFFFF",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#8A8A8A",
  textDisabled: "#5C5C5C",

  // Accent — used sparingly for positive/status only
  green: "#4ade80",
  greenDark: "#16a34a",
  greenDim: "#052e16",
  greenTint: "rgba(74,222,128,0.10)",

  // Primary action
  primary: "#FFFFFF",
  primaryText: "#000000",

  // Accent + highlight (neutral fallback in dark)
  accent: "#FFFFFF",
  accentText: "#000000",
  highlight: "#FBBF24",

  // Danger
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.15)",

  // Radii
  radius: 8,
  radiusLg: 12,
  radiusXl: 16,

  // Tab bar
  tabBg: "#000000",
  tabBorder: "#1F1F1F",
  tabActive: "#FFFFFF",
  tabInactive: "#737373",
};

const light: PaletteShape = {
  // Backgrounds — Uber-white
  bg: "#FFFFFF",
  surface: "#F6F6F6",
  surfaceAlt: "#EFEFEF",
  surfaceHi: "#E5E5E5",
  border: "#EFEFEF",
  borderMid: "#D4D4D4",
  borderFocus: "#000000",

  // Text
  textPrimary: "#000000",
  textSecondary: "#525252",
  textMuted: "#737373",
  textDisabled: "#A3A3A3",

  // Accent — deeper green reads better on white
  green: "#16a34a",
  greenDark: "#15803d",
  greenDim: "#dcfce7",
  greenTint: "rgba(22,163,74,0.08)",

  // Primary action — black on light bg
  primary: "#000000",
  primaryText: "#FFFFFF",

  // Accent + highlight (neutral fallback in light)
  accent: "#000000",
  accentText: "#FFFFFF",
  highlight: "#F59E0B",

  // Danger
  red: "#DC2626",
  redDim: "rgba(220,38,38,0.10)",

  // Radii
  radius: 8,
  radiusLg: 12,
  radiusXl: 16,

  // Tab bar
  tabBg: "#FFFFFF",
  tabBorder: "#EFEFEF",
  tabActive: "#000000",
  tabInactive: "#737373",
};

// Warm Orange — soft, friendly, social.
// Muted orange CTA (not too bright), cream backgrounds, amber for badges.
const fun: PaletteShape = {
  // Backgrounds — warm cream, easy on the eyes
  bg: "#FFFBF5",
  surface: "#FFF6EC",
  surfaceAlt: "#FFEBD6",
  surfaceHi: "#FFDCBA",
  border: "#F4E3CF",
  borderMid: "#E8C9A7",
  borderFocus: "#FB923C",

  // Text — warm near-black, not pure black
  textPrimary: "#1F1A14",
  textSecondary: "#5B4F42",
  textMuted: "#8C7F70",
  textDisabled: "#C2B5A4",

  // Success/savings — emerald (positive numbers stay readable)
  green: "#10B981",
  greenDark: "#059669",
  greenDim: "#D1FAE5",
  greenTint: "rgba(16,185,129,0.10)",

  // Primary action — softer warm orange (orange-400, less bright than amber-400)
  primary: "#FB923C",
  primaryText: "#FFFFFF",

  // Secondary accent — deeper orange for active states / chevrons
  accent: "#F97316",
  accentText: "#FFFFFF",

  // Highlight — amber for badges & stars
  highlight: "#F59E0B",

  // Danger
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.12)",

  // Radii — rounder for a softer, social feel
  radius: 12,
  radiusLg: 18,
  radiusXl: 22,

  // Tab bar — orange active on cream
  tabBg: "#FFFBF5",
  tabBorder: "#F4E3CF",
  tabActive: "#FB923C",
  tabInactive: "#8C7F70",
};

export type Palette = PaletteShape;

// ─── Typography (colors come from palette) ───────────────────────────────────

const makeFont = (P: Palette) =>
  ({
    label: {
      color: P.textMuted,
      fontSize: 11,
      fontWeight: "700" as const,
      letterSpacing: 0.6,
      textTransform: "uppercase" as const,
    },
    sectionTitle: {
      color: P.textPrimary,
      fontSize: 18,
      fontWeight: "700" as const,
      letterSpacing: -0.2,
    },
    pageTitle: {
      color: P.textPrimary,
      fontSize: 30,
      fontWeight: "800" as const,
      letterSpacing: -0.6,
    },
    body: { color: P.textPrimary, fontSize: 15 },
    bodyMuted: { color: P.textSecondary, fontSize: 14 },
    stat: {
      color: P.textPrimary,
      fontSize: 28,
      fontWeight: "800" as const,
      letterSpacing: -0.5,
    },
    caption: { color: P.textMuted, fontSize: 12 },
  }) as const;

export type FontTokens = ReturnType<typeof makeFont>;

// ─── Static exports (default to dark) ────────────────────────────────────────

export const C = dark;
export const FONT = makeFont(dark);

// ─── Context + provider + hook ───────────────────────────────────────────────

export type Scheme = "light" | "dark" | "fun";
export type ThemeOverride = "system" | "light" | "dark" | "fun";

type ThemeValue = {
  C: Palette;
  FONT: FontTokens;
  scheme: Scheme;
  override: ThemeOverride;
  setOverride: (o: ThemeOverride) => void;
};

const STORAGE_KEY = "appearanceOverride";

const ThemeContext = createContext<ThemeValue>({
  C: dark,
  FONT: makeFont(dark),
  scheme: "dark",
  override: "system",
  setOverride: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverrideState] = useState<ThemeOverride>("fun");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (cancelled) return;
      if (v === "light" || v === "dark" || v === "system" || v === "fun") {
        setOverrideState(v);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setOverride = (o: ThemeOverride) => {
    setOverrideState(o);
    AsyncStorage.setItem(STORAGE_KEY, o).catch(() => {});
  };

  const scheme: Scheme =
    override === "system" ? (system === "light" ? "light" : "fun") : override;

  const value = useMemo<ThemeValue>(() => {
    const palette =
      scheme === "light" ? light : scheme === "fun" ? fun : dark;
    return {
      C: palette,
      FONT: makeFont(palette),
      scheme,
      override,
      setOverride,
    };
    // setOverride is stable enough — recreating per-render is fine for context value
    // since memoization is keyed on scheme/override.
  }, [scheme, override]);

  // Render children regardless of hydration so the app doesn't flash blank;
  // first paint will be the system default, then snap to stored override.
  void hydrated;

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
