import { ref, watch } from 'vue';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'miku-space-theme';

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return 'light';
}

const theme = ref<ThemeMode>(readInitialTheme());

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', mode === 'dark' ? '#070C14' : '#39C5BB');
  }
}

applyTheme(theme.value);

watch(theme, (next) => {
  applyTheme(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors
  }
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
