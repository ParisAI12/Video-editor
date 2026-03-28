// ——— ELEMENTS ———
const fileInput = document.getElementById("file-input");
const playlistEl = document.getElementById("playlist");
const video = document.getElementById("video");
const overlayPreview = document.getElementById("overlay-preview");

const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const seekBar = document.getElementById("seek-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const volumeBar = document.getElementById("volume-bar");
const muteBtn = document.getElementById("mute-btn");

const playbackRateSelect = document.getElementById("playback-rate");
const loopToggle = document.getElementById("loop-toggle");

const pipBtn = document.getElementById("pip-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");

const snapshotBtn = document.getElementById("snapshot-btn");
const exportClipBtn = document.getElementById("export-clip-btn");
const statusEl = document.getElementById("status");

const trimStartInput = document.getElementById("trim-start");
const trimEndInput = document.getElementById("trim-end");
const trimRangeStart = document.getElementById("trim-range-start");
const trimRangeEnd = document.getElementById("trim-range-end");

const overlayTextInput = document.getElementById("overlay-text");
const overlaySizeInput = document.getElementById("overlay-size");
const overlayPositionInput = document.getElementById("overlay-position");
const clearOverlayBtn = document.getElementById("clear-overlay-btn");

const infoName = document.getElementById("info-name");
const infoRes = document.getElementById("info-res");
const infoDur = document.getElementById("info-dur");
const infoRate = document.getElementById("info-rate");

const hiddenCanvas = document.getElementById("hidden-canvas");

// ——— STATE ———
let playlist = [];
let currentIndex = -1;
let isSeeking = false;
let trimStart = 0;
let trimEnd = 0;

// ——— HELPERS ———
function formatTime(sec) {
  if (!isFinite(sec)) return "00:00";
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function updateInfoPanel() {
  if (!video.src) {
    infoName.textContent = "–";
    infoRes.textContent = "–";
    infoDur.textContent = "–";
    return;
  }
  const item = playlist[currentIndex];
  infoName.textContent = item ? item.name : "–";
  infoRes.textContent = `${video.videoWidth || 0} × ${video.videoHeight || 0}`;
  infoDur.textContent = formatTime(video.duration || 0);
 
