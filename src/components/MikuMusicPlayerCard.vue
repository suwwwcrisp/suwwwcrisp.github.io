<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { resolveAssetUrl, siteConfig } from '@/data/siteConfig';

const coverUrl = resolveAssetUrl('images/portal/miku-player-cover.jpg');
const songs = siteConfig.about.acgCard.songs;

const trackIndex = ref(0);
const isPlaying = ref(false);
const liked = ref(true);
const elapsedSec = ref(39);
const totalSec = 99; // 1:39

const currentSong = computed(() => songs[trackIndex.value] ?? songs[0]);
const progressPct = computed(() =>
  Math.min(100, Math.max(0, (elapsedSec.value / totalSec) * 100)),
);

function formatSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? '0' : ''}${rem}`;
}

const currentTimeStr = computed(() => formatSec(elapsedSec.value));
const totalTimeStr = computed(() => formatSec(totalSec));

let timerId: number | null = null;
let audioCtx: AudioContext | null = null;
let noteTick = 0;

const CHIME_FREQS = [523.25, 659.25, 783.99, 880.0, 987.77, 1174.66];

function playSoftNote() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    const freq = CHIME_FREQS[(noteTick + trackIndex.value * 2) % CHIME_FREQS.length];
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.032, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
    noteTick += 1;
  } catch {
    // Ignore restricted AudioContext contexts
  }
}

function stopPlaybackTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function startPlaybackTimer() {
  stopPlaybackTimer();
  playSoftNote();
  timerId = window.setInterval(() => {
    elapsedSec.value = elapsedSec.value >= totalSec ? 0 : elapsedSec.value + 1;
    playSoftNote();
  }, 1000);
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startPlaybackTimer();
  } else {
    stopPlaybackTimer();
  }
}

function selectTrack(idx: number) {
  trackIndex.value = (idx + songs.length) % songs.length;
  elapsedSec.value = 39;
  if (isPlaying.value) {
    startPlaybackTimer();
  }
}

function handleSeek(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement | null;
  if (!bar) return;
  const rect = bar.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  elapsedSec.value = Math.round(ratio * totalSec);
}

function toggleLike(event: MouseEvent) {
  liked.value = !liked.value;
  if (liked.value) {
    window.dispatchEvent(
      new CustomEvent('miku-note-burst', {
        detail: { x: event.clientX, y: event.clientY, count: 6 },
      }),
    );
  }
}

onBeforeUnmount(() => {
  stopPlaybackTimer();
  if (audioCtx) {
    void audioCtx.close().catch(() => {});
    audioCtx = null;
  }
});
</script>

<template>
  <article class="glass-card glass-card--interactive miku-player-card">
    <div class="player-cover-col">
      <div class="player-cover-frame" :class="{ 'is-playing': isPlaying }">
        <img
          :src="coverUrl"
          alt="初音未来音乐播放器封面"
          class="player-cover-img"
          width="560"
          height="560"
        />
      </div>
    </div>

    <div class="player-main-col">
      <header class="player-top-bar">
        <div class="player-track-pills" role="tablist" aria-label="切换 39 歌单曲目">
          <button
            v-for="(song, idx) in songs"
            :key="song.title"
            type="button"
            role="tab"
            class="track-pill mono"
            :class="{ 'is-active': idx === trackIndex }"
            :aria-selected="idx === trackIndex"
            @click="selectTrack(idx)"
          >
            0{{ idx + 1 }}
          </button>
        </div>

        <span class="player-bpm mono">{{ currentSong.bpm }}</span>

        <button
          type="button"
          class="player-heart-btn"
          :class="{ 'is-liked': liked }"
          :aria-pressed="liked"
          aria-label="收藏这首歌"
          @click="toggleLike($event)"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </header>

      <div class="player-meta">
        <h4 class="player-song-title">♪ {{ currentSong.title }}</h4>
        <p class="player-song-sub">
          <span class="mono">{{ currentSong.producer }}</span> / {{ currentSong.note }}
        </p>
      </div>

      <div class="player-scrubber-wrap">
        <div
          class="player-progress-bar"
          role="slider"
          aria-label="播放进度"
          :aria-valuenow="elapsedSec"
          aria-valuemin="0"
          :aria-valuemax="totalSec"
          tabindex="0"
          @click="handleSeek($event)"
        >
          <div class="player-progress-fill" :style="{ width: `${progressPct}%` }" />
          <span class="player-progress-dot" :style="{ left: `${progressPct}%` }" />
        </div>

        <div class="player-time-row mono">
          <span>{{ currentTimeStr }}</span>
          <span>{{ totalTimeStr }}</span>
        </div>
      </div>

      <div class="player-controls-row">
        <button
          type="button"
          class="ctrl-btn"
          aria-label="上一首"
          @click="selectTrack(trackIndex - 1)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          type="button"
          class="ctrl-btn ctrl-btn--play"
          :aria-label="isPlaying ? '暂停' : '播放'"
          @click="togglePlay"
        >
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <button
          type="button"
          class="ctrl-btn"
          aria-label="下一首"
          @click="selectTrack(trackIndex + 1)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M16 6h2v12h-2zm-1.5 6L6 18V6z" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.miku-player-card {
  padding: 0.9rem 1.2rem;
  min-height: 186px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.15rem;
  align-items: center;
  background: linear-gradient(
    132deg,
    rgba(222, 249, 243, 0.72) 0%,
    rgba(196, 241, 232, 0.56) 48%,
    rgba(170, 231, 220, 0.65) 100%
  );
  border-color: rgba(57, 197, 187, 0.34);
}

[data-theme='dark'] .miku-player-card {
  background: linear-gradient(
    132deg,
    rgba(16, 40, 52, 0.86) 0%,
    rgba(12, 28, 42, 0.9) 52%,
    rgba(18, 44, 56, 0.88) 100%
  );
  border-color: rgba(76, 235, 224, 0.35);
}

.player-cover-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-cover-frame {
  width: 138px;
  height: 138px;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid rgba(25, 62, 68, 0.42);
  box-shadow: 0 12px 24px -14px rgba(17, 54, 68, 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.player-cover-frame.is-playing {
  transform: scale(1.03);
  box-shadow:
    0 14px 28px -12px rgba(57, 197, 187, 0.52),
    0 0 0 3px rgba(57, 197, 187, 0.25);
}

[data-theme='dark'] .player-cover-frame {
  border-color: rgba(76, 235, 224, 0.48);
}

.player-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.player-main-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.46rem;
}

.player-top-bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.player-track-pills {
  display: inline-flex;
  gap: 0.32rem;
}

.track-pill {
  border: 1px solid rgba(25, 62, 68, 0.22);
  background: rgba(255, 255, 255, 0.55);
  color: #1c3a3f;
  padding: 0.14rem 0.46rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-pill.is-active {
  background: #1c3a3f;
  color: #e6fffb;
  border-color: transparent;
}

[data-theme='dark'] .track-pill {
  background: rgba(18, 34, 52, 0.8);
  border-color: rgba(76, 235, 224, 0.28);
  color: var(--text-secondary);
}

[data-theme='dark'] .track-pill.is-active {
  background: var(--miku-teal);
  color: #061419;
}

.player-bpm {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 600;
  color: #197871;
}

[data-theme='dark'] .player-bpm {
  color: var(--miku-teal);
}

.player-heart-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.52);
  color: rgba(28, 58, 63, 0.35);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.player-heart-btn.is-liked {
  color: #e53e63;
}

.player-heart-btn:hover {
  transform: scale(1.1);
}

[data-theme='dark'] .player-heart-btn {
  background: rgba(18, 34, 52, 0.78);
  color: rgba(235, 249, 248, 0.35);
}

[data-theme='dark'] .player-heart-btn.is-liked {
  color: #ff4b78;
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.player-song-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: #162b2f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .player-song-title {
  color: var(--text-primary);
}

.player-song-sub {
  margin: 0;
  font-size: 0.75rem;
  color: #355459;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .player-song-sub {
  color: var(--text-secondary);
}

.player-scrubber-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  margin-top: 0.1rem;
}

.player-progress-bar {
  position: relative;
  height: 4px;
  border-radius: 999px;
  background: rgba(22, 43, 47, 0.24);
  cursor: pointer;
}

[data-theme='dark'] .player-progress-bar {
  background: rgba(235, 249, 248, 0.22);
}

.player-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #162b2f;
}

[data-theme='dark'] .player-progress-fill {
  background: var(--miku-teal);
}

.player-progress-dot {
  position: absolute;
  top: 50%;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #162b2f;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(17, 54, 68, 0.35);
}

[data-theme='dark'] .player-progress-dot {
  background: #ffffff;
}

.player-time-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: #355459;
}

[data-theme='dark'] .player-time-row {
  color: var(--text-muted);
}

.player-controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
}

.ctrl-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #162b2f;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease;
}

.ctrl-btn:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.45);
}

.ctrl-btn--play {
  width: 36px;
  height: 36px;
  background: #162b2f;
  color: #e6fffb;
  box-shadow: 0 6px 14px -6px rgba(17, 54, 68, 0.45);
}

.ctrl-btn--play:hover {
  background: #124249;
}

[data-theme='dark'] .ctrl-btn {
  color: var(--text-primary);
}

[data-theme='dark'] .ctrl-btn:hover {
  background: rgba(76, 235, 224, 0.18);
}

[data-theme='dark'] .ctrl-btn--play {
  background: var(--miku-teal);
  color: #061419;
}

@media (max-width: 640px) {
  .miku-player-card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .player-main-col {
    width: 100%;
  }

  .player-cover-frame {
    width: 118px;
    height: 118px;
  }
}
</style>
