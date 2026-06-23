import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { View } from "react-native";

export type Scheme = "light" | "dark";

type Palette = {
  white: string;
  black: string;
  bg: string;
  surface: string;

  stone50: string;
  stone100: string;
  stone200: string;
  stone300: string;
  stone400: string;
  stone500: string;
  stone600: string;
  stone700: string;
  stone800: string;
  stone900: string;
  stone950: string;

  amber50: string;
  amber100: string;
  amber200: string;
  amber300: string;
  amber400: string;
  amber500: string;
  amber600: string;
  amber700: string;

  emerald50: string;
  emerald500: string;
  emerald700: string;

  red50: string;
  red100: string;
  red600: string;
  red700: string;

  blue50: string;
  blue700: string;

  shadow: string;
  overlay: string;
};

// Toned-down gold for the light theme — deeper, less neon than the original amber.
const LIGHT: Palette = {
  white: "#FFFFFF",
  black: "#000000",
  bg: "#FFFFFF",
  surface: "#FFFFFF",

  stone50: "#FAFAF9",
  stone100: "#F5F5F4",
  stone200: "#E7E5E4",
  stone300: "#D6D3D1",
  stone400: "#A8A29E",
  stone500: "#78716C",
  stone600: "#57534E",
  stone700: "#44403C",
  stone800: "#292524",
  stone900: "#1C1917",
  stone950: "#0C0A09",

  amber50: "#FAF3E0",
  amber100: "#F1E3BB",
  amber200: "#E5CE89",
  amber300: "#D6B459",
  amber400: "#C99A33",
  amber500: "#B08020",
  amber600: "#8A6418",
  amber700: "#6B4F12",

  emerald50: "#ECFDF5",
  emerald500: "#10B981",
  emerald700: "#047857",

  red50: "#FEF2F2",
  red100: "#FEE2E2",
  red600: "#DC2626",
  red700: "#B91C1C",

  blue50: "#EFF6FF",
  blue700: "#1D4ED8",

  shadow: "rgba(0,0,0,0.06)",
  overlay: "rgba(0,0,0,0.3)",
};

// Dark theme: page goes dark, stones invert so existing "text"/"surface" uses
// land in the right contrast bucket. Gold is warmer + lighter to pop on dark.
const DARK: Palette = {
  white: "#FFFFFF",
  black: "#000000",
  bg: "#0F0F0F",
  surface: "#1A1A1A",

  stone50: "#1C1917",
  stone100: "#292524",
  stone200: "#44403C",
  stone300: "#57534E",
  stone400: "#78716C",
  stone500: "#A8A29E",
  stone600: "#C7C3C0",
  stone700: "#D6D3D1",
  stone800: "#E7E5E4",
  stone900: "#F5F5F4",
  stone950: "#FAFAF9",

  amber50: "#33240F",
  amber100: "#4A361A",
  amber200: "#6A4F2A",
  amber300: "#8B6936",
  amber400: "#B8924A",
  amber500: "#CFAA66",
  amber600: "#E0BD85",
  amber700: "#EFD3A5",

  emerald50: "#0F2A1F",
  emerald500: "#34D399",
  emerald700: "#6EE7B7",

  red50: "#2A1414",
  red100: "#3F1E1E",
  red600: "#F87171",
  red700: "#FCA5A5",

  blue50: "#15233F",
  blue700: "#93C5FD",

  shadow: "rgba(0,0,0,0.4)",
  overlay: "rgba(0,0,0,0.6)",
};

// Mutable palette: components import M directly. When the scheme changes we
// Object.assign the active palette into M and remount the tree (key={scheme})
// so every component re-reads the values on its next render.
export const M: Palette = { ...LIGHT };

function applyScheme(scheme: Scheme) {
  Object.assign(M, scheme === "dark" ? DARK : LIGHT);
}

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

const STORAGE_KEY = "cotripMockScheme";

type ThemeCtx = {
  scheme: Scheme;
  setScheme: (s: Scheme) => void;
  toggleScheme: () => void;
};

const MockThemeContext = createContext<ThemeCtx>({
  scheme: "light",
  setScheme: () => {},
  toggleScheme: () => {},
});

export function MockThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<Scheme>("light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === "light" || v === "dark") setSchemeState(v);
      })
      .catch(() => {});
  }, []);

  // Sync the live M palette before children render so first paint is correct.
  applyScheme(scheme);

  const setScheme = (s: Scheme) => {
    setSchemeState(s);
    AsyncStorage.setItem(STORAGE_KEY, s).catch(() => {});
  };
  const toggleScheme = () => setScheme(scheme === "dark" ? "light" : "dark");

  return React.createElement(
    MockThemeContext.Provider,
    { value: { scheme, setScheme, toggleScheme } },
    React.createElement(
      View,
      { key: scheme, style: { flex: 1, backgroundColor: M.bg } },
      children
    )
  );
}

export function useMockTheme(): ThemeCtx {
  return useContext(MockThemeContext);
}
