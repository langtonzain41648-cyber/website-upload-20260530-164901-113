function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".player-cover");
  var starter = document.querySelector("[data-player-start]");
  var initialized = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function setup() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    setup();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playing = video.play();
    if (playing && typeof playing.catch === "function") {
      playing.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (starter) {
    starter.addEventListener("click", start);
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
