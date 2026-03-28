const fileInput = document.getElementById("video-input");
const video = document.getElementById("preview-video");
const inTime = document.getElementById("in-time");
const outTime = document.getElementById("out-time");
const overlayText = document.getElementById("overlay-text");
const exportBtn = document.getElementById("export-btn");

let videoURL = null;
let clipIn = 0;
let clipOut = 0;

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (videoURL) URL.revokeObjectURL(videoURL);
    videoURL = URL.createObjectURL(file);

    video.src = videoURL;
    video.load();

    video.onloadedmetadata = () => {
        clipIn = 0;
        clipOut = video.duration;
        inTime.value = clipIn;
        outTime.value = clipOut;
    };
});

inTime.addEventListener("input", () => {
    clipIn = Math.max(0, parseFloat(inTime.value));
    if (clipIn >= clipOut) clipIn = clipOut - 0.1;
});

outTime.addEventListener("input", () => {
    clipOut = Math.min(video.duration, parseFloat(outTime.value));
    if (clipOut <= clipIn) clipOut = clipIn + 0.1;
});

exportBtn.addEventListener("click", async () => {
    if (!video.src) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "edited-video.webm";
        a.click();
    };

    video.currentTime = clipIn;
    await video.play();

    recorder.start();

    function draw() {
        if (video.currentTime >= clipOut) {
            recorder.stop();
            video.pause();
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (overlayText.value.trim() !== "") {
            ctx.font = "40px sans-serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(overlayText.value, canvas.width / 2, canvas.height - 50);
        }

        requestAnimationFrame(draw);
    }

    draw();
});
