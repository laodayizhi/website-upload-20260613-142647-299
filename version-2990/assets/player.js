const players = document.querySelectorAll("[data-player]");

players.forEach((player) => {
    const video = player.querySelector("video");
    const cover = player.querySelector(".player-cover");

    if (!video || !cover) {
        return;
    }

    let hls = null;
    let ready = false;

    const bindSource = () => {
        if (ready) {
            return;
        }

        const source = video.dataset.videoUrl;

        if (!source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            ready = true;
            return;
        }

        video.src = source;
        ready = true;
    };

    const start = () => {
        bindSource();
        cover.classList.add("is-hidden");
        video.controls = true;
        const playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(() => {
                cover.classList.remove("is-hidden");
            });
        }
    };

    cover.addEventListener("click", start);

    video.addEventListener("click", () => {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
});
