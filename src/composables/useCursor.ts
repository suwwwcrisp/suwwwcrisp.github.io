import { ref, watch } from 'vue';

const STORAGE_KEY = 'miku-space-custom-cursor';

function readInitialCursorState(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch {
    // Ignore storage errors
  }
  return true;
}

const customCursorEnabled = ref<boolean>(readInitialCursorState());

watch(customCursorEnabled, (val) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(val));
  } catch {
    // Ignore storage errors
  }
});

export function useMikuCursor() {
  function toggleCustomCursor() {
    customCursorEnabled.value = !customCursorEnabled.value;
  }

  return {
    customCursorEnabled,
    toggleCustomCursor,
  };
}
