import { ref, watch } from 'vue';

const STORAGE_KEY = 'miku-space-note-fx';

function readInitialNoteFx(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch {
    // Ignore storage errors
  }
  return true;
}

const noteFxEnabled = ref<boolean>(readInitialNoteFx());

watch(noteFxEnabled, (val) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(val));
  } catch {
    // Ignore storage errors
  }
});

export function useNoteFx() {
  function toggleNoteFx() {
    noteFxEnabled.value = !noteFxEnabled.value;
  }

  return {
    noteFxEnabled,
    toggleNoteFx,
  };
}
