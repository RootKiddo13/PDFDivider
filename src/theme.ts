const STORAGE_KEY = "pdfdivider-theme";
const THEME_COLORS = {
  light: "#f5f5f7",
  dark: "#151517",
} as const;

type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = Exclude<ThemePreference, "system">;

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function getDarkModeQuery(): MediaQueryList | undefined {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : undefined;
}

function resolveTheme(
  preference: ThemePreference,
  darkModeQuery: MediaQueryList | undefined,
): ResolvedTheme {
  if (preference !== "system") return preference;
  return darkModeQuery?.matches ? "dark" : "light";
}

function getThemeColorMeta(): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  return meta;
}

export function initializeTheme(): void {
  const preferenceSelect = document.querySelector<HTMLSelectElement>("#theme-preference");
  const darkModeQuery = getDarkModeQuery();
  const themeColorMeta = getThemeColorMeta();
  let preference = readStoredPreference();

  const applyTheme = (): void => {
    const resolvedTheme = resolveTheme(preference, darkModeQuery);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = resolvedTheme;
    themeColorMeta.content = THEME_COLORS[resolvedTheme];
    if (preferenceSelect) preferenceSelect.value = preference;
  };

  const setPreference = (value: unknown, persist: boolean): void => {
    preference = isThemePreference(value) ? value : "system";
    if (persist && isThemePreference(value)) {
      try {
        window.localStorage.setItem(STORAGE_KEY, preference);
      } catch {
        // Theme changes remain usable when browser storage is unavailable.
      }
    }
    applyTheme();
  };

  applyTheme();

  preferenceSelect?.addEventListener("change", () => {
    setPreference(preferenceSelect.value, true);
  });

  const onSystemThemeChange = (): void => {
    if (preference === "system") applyTheme();
  };
  if (darkModeQuery && typeof darkModeQuery.addEventListener === "function") {
    darkModeQuery.addEventListener("change", onSystemThemeChange);
  } else if (darkModeQuery) {
    const legacyAddListener = (
      darkModeQuery as MediaQueryList & {
        addListener?: (listener: () => void) => void;
      }
    ).addListener;
    if (typeof legacyAddListener === "function") {
      legacyAddListener.call(darkModeQuery, onSystemThemeChange);
    }
  }

  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      setPreference(event.key === null ? null : event.newValue, false);
    }
  });
}
