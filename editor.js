// ELEMENTS
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

// STATE
let playlist = [];
let currentIndex = -1;
let isSeeking = false;
let trimStart = 0;
let trimEnd = 0;

// HELPERS
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
  infoRate.textContent = `${video.playbackRate.toFixed(2)}x`;
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  playlist.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "playlist-item" + (index === currentIndex ? " active" : "");
    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = item.name;

    const metaSpan = document.createElement("span");
    metaSpan.className = "meta";
    metaSpan.textContent = item.duration ? formatTime(item.duration) : "";

    li.appendChild(nameSpan);
    li.appendChild(metaSpan);

    li.addEventListener("click", () => {
      loadFromPlaylist(index);
    });

    playlistEl.appendChild(li);
  });
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ff4f6b" : "#9ca3c7";
}

// LOAD & PLAYLIST

fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files || []);
  if (!files.length) return;

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const item = { name: file.name, url, duration: null };
    playlist.push(item);

    // Preload metadata
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      item.duration = tempVideo.duration;
      renderPlaylist();
    };
  });

  if (currentIndex === -1 && playlist.length > 0) {
    loadFromPlaylist(0);
  } else {
    renderPlaylist();
  }

  fileInput.value = "";
});

function loadFromPlaylist(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const item = playlist[index];
  video.src = item.url;
  video.load();
  setStatus(`Loaded: ${item.name}`);
  renderPlaylist();

  video.onloadedmetadata = () => {
    seekBar.max = video.duration.toFixed(2);
    seekBar.value = 0;
    durationEl.textContent = formatTime(video.duration);
    currentTimeEl.textContent = "00:00";

    trimStart = 0;
    trimEnd = video.duration;
    trimStartInput.value = trimStart.toFixed(2);
    trimEndInput.value = trimEnd.toFixed(2);
    trimRangeStart.min = 0;
    trimRangeStart.max = video.duration.toFixed(2);
    trimRangeEnd.min = 0;
    trimRangeEnd.max = video.duration.toFixed(2);
    trimRangeStart.value = trimStart.toFixed(2);
    trimRangeEnd.value = trimEnd.toFixed(2);

    updateInfoPanel();
  };
}

// PLAYBACK CONTROLS

playPauseBtn.addEventListener("click", togglePlayPause);
video.addEventListener("click", togglePlayPause);

function togglePlayPause() {
  if (!video.src) return;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

video.addEventListener("play", () => {
  playPauseBtn.textContent = "⏸";
});

video.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶";
});

video.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    seekBar.value = video.currentTime.toFixed(2);
  }
  currentTimeEl.textContent = formatTime(video.currentTime);
});

seekBar.addEventListener("input", () => {
  isSeeking = true;
});

seekBar.addEventListener("change", () => {
  video.currentTime = parseFloat(seekBar.value) || 0;
  isSeeking = false;
});

prevBtn.addEventListener("click", () => {
  if (playlist.length === 0) return;
  const nextIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadFromPlaylist(nextIndex);
});

nextBtn.addEventListener("click", () => {
  if (playlist.length === 0) return;
  const nextIndex = (currentIndex + 1) % playlist.length;
  loadFromPlaylist(nextIndex);
});

video.addEventListener("ended", () => {
  if (loopToggle.checked) {
    video.currentTime = trimStart || 0;
    video.play();
  } else {
    nextBtn.click();
  }
});

// VOLUME & RATE

volumeBar.addEventListener("input", () => {
  video.volume = parseFloat(volumeBar.value);
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "🔇" : "🔊";
});

playbackRateSelect.addEventListener("change", () => {
  video.playbackRate = parseFloat(playbackRateSelect.value) || 1;
  updateInfoPanel();
});

loopToggle.addEventListener("change", () => {
  setStatus(loopToggle.checked ? "Loop enabled" : "Loop disabled");
});

// FULLSCREEN & PIP

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await video.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
});

pipBtn.addEventListener("click", async () => {
  if (!("pictureInPictureEnabled" in document)) {
    setStatus("Picture-in-Picture not supported in this browser", true);
    return;
  }
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (e) {
    setStatus("Unable to enter Picture-in-Picture", true);
  }
});

// TRIM

function syncTrimInputs() {
  trimStartInput.value = trimStart.toFixed(2);
  trimEndInput.value = trimEnd.toFixed(2);
  trimRangeStart.value = trimStart.toFixed(2);
  trimRangeEnd.value = trimEnd.toFixed(2);
}

trimRangeStart.addEventListener("input", () => {
  const v = parseFloat(trimRangeStart.value) || 0;
  trimStart = Math.min(v, trimEnd - 0.05);
  syncTrimInputs();
});

trimRangeEnd.addEventListener("input", () => {
  const v = parseFloat(trimRangeEnd.value) || 0;
  trimEnd = Math.max(v, trimStart + 0.05);
  syncTrimInputs();
});

trimStartInput.addEventListener("change", () => {
  let v = parseFloat(trimStartInput.value) || 0;
  v = Math.max(0, Math.min(v, video.duration - 0.05));
  trimStart = Math.min(v, trimEnd - 0.05);
  syncTrimInputs();
});

trimEndInput.addEventListener("change", () => {
  let v = parseFloat(trimEndInput.value) || 0;
  v = Math.max(0.05, Math.min(v, video.duration));
  trimEnd = Math.max(v, trimStart + 0.05);
  syncTrimInputs();
});

// OVERLAY

overlayTextInput.addEventListener("input", () => {
  overlayPreview.textContent = overlayTextInput.value;
});

overlaySizeInput.addEventListener("input", () => {
  overlayPreview.style.fontSize = overlaySizeInput.value + "px";
});

overlayPositionInput.addEventListener("input", () => {
  overlayPreview.style.bottom = overlayPositionInput.value + "%";
});

clearOverlayBtn.addEventListener("click", () => {
  overlayTextInput.value = "";
  overlayPreview.textContent = "";
});

// SNAPSHOT

snapshotBtn.addEventListener("click", () => {
  if (!video.videoWidth || !video.videoHeight) return;
  hiddenCanvas.width = video.videoWidth;
  hiddenCanvas.height = video.videoHeight;
  const ctx = hiddenCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

  if (overlayPreview.textContent.trim() !== "") {
    ctx.font = `${overlaySizeInput.value}px system-ui`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 8;
    const y =
      hiddenCanvas.height -
      (hiddenCanvas.height * (overlayPositionInput.value / 100));
    ctx.fillText(
      overlayPreview.textContent,
      hiddenCanvas.width / 2,
      y
    );
  }

  hiddenCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snapshot.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("Snapshot saved as PNG");
  }, "image/png");
});

// EXPORT CLIP

exportClipBtn.addEventListener("click", async () => {
  if (!video.src || !video.videoWidth || !video.videoHeight) return;

  setStatus("Exporting clip...", false);
  exportClipBtn.disabled = true;

  const width = video.videoWidth;
  const height = video.videoHeight;
  hiddenCanvas.width = width;
  hiddenCanvas.height = height;
  const ctx = hiddenCanvas.getContext("2d");

  const stream = hiddenCanvas.captureStream(30);
  let recorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
  } catch {
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  }

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trimmed-clip.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("Export complete.");
    exportClipBtn.disabled = false;
  };

  video.pause();
  video.currentTime = trimStart;
  await video.play().catch(() => {});

  const startTime = video.currentTime;
  const targetDuration = trimEnd - trimStart;

  recorder.start(100);

  function drawFrame() {
    const elapsed = video.currentTime - startTime;
    if (elapsed >= targetDuration || video.ended) {
      recorder.stop();
      video.pause();
      video.currentTime = trimStart;
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    if (overlayPreview.textContent.trim() !== "") {
      ctx.font = `${overlaySizeInput.value}px system-ui`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      const y =
        height - (height * (overlayPositionInput.value / 100));
      ctx.fillText(overlayPreview.textContent, width / 2, y);
    }

    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);
});

// KEYBOARD SHORTCUTS

document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

  switch (e.key.toLowerCase()) {
    case " ":
      e.preventDefault();
      togglePlayPause();
      break;
    case "arrowright":
      video.currentTime = Math.min(
        video.currentTime + 5,
        video.duration || video.currentTime + 5
      );
      break;
    case "arrowleft":
      video.currentTime = Math.max(video.currentTime - 5, 0);
      break;
    case "arrowup":
      video.volume = Math.min(video.volume + 0.05, 1);
      volumeBar.value = video.volume.toFixed(2);
      break;
    case "arrowdown":
      video.volume = Math.max(video.volume - 0.05, 0);
      volumeBar.value = video.volume.toFixed(2);
      break;
    case "f":
      fullscreenBtn.click();
      break;
    case "m":
      muteBtn.click();
      break;
    case "l":
      loopToggle.checked = !loopToggle.checked;
      loopToggle.dispatchEvent(new Event("change"));
      break;
    case "s":
      snapshotBtn.click();
      break;
  }
});
