import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";
import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "./types.js";

interface ThemeContextValue {
  theme: ResolvedTheme;
  tokens?: SkinTokens;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "light" });

export interface ThemeProviderProps {
  theme: ResolvedTheme;
  /** Resolved per-theme tokens for the active skin. */
  tokens?: SkinTokens;
  children?: ReactNode;
}

/** Provides the resolved theme + tokens to every skin component below it. */
export function ThemeProvider({
  theme,
  tokens,
  children,
}: ThemeProviderProps): ReactElement {
  return (
    <ThemeContext.Provider value={{ theme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** The resolved theme (`"light" | "dark"`) for the current subtree. */
export function useTheme(): ResolvedTheme {
  return useContext(ThemeContext).theme;
}

/** The resolved design tokens for the current subtree, if provided. */
export function useTokens(): SkinTokens | undefined {
  return useContext(ThemeContext).tokens;
}
