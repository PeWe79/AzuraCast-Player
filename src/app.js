/**
 * Main app JS entry file.
 */
import "./scss/app.scss";
import "./js/filters";
import "./js/favorite";
import _api from "./js/api";
import _audio from "./js/audio";
import _scene from "./js/scene";
import _utils from "./js/utils";
import _store from "./js/store";

// main vue app
new Vue({
  el: "#app",
  data: {
    // toggles
    init: false,
    visible: true,
    playing: false,
    loading: false,
    sidebar: false,
    volume: 80,
    // sidebar toggles
    sbActive: false,
    sbVisible: false,
    // stations stuff
    route: "/",
    stations: [],
    station: {},
    songs: [],
    track: {},
    image: {},
    itunes: {},
    favorites: [],
    errors: {},
    // timer stuff
    timeStart: 0,
    timeDisplay: "00:00:00",
    timeItv: null,
    // sorting stuff
    searchText: "",
    sortParam: "listeners",
    sortOrder: "desc",
    // timer stuff
    anf: null,
    sto: null,
    itv: null,
  },

  // watch methods
  watch: {
    // watch playing status
    playing() {
      if (this.playing) {
        this.startClock();
      } else {
        this.stopClock();
      }
    },

    // update player volume
    volume() {
      _audio.setVolume(this.volume);
    },
  },

  // computed methods
  computed: {
    // filter stations list
    channelsList() {
      let list = this.stations.slice();
      let search = this.searchText
        .replace(/[^\w\s\-]+/g, "")
        .replace(/[\r\s\t\n]+/g, " ")
        .trim();

      if (search && search.length > 1) {
        list = _utils.search(list, "name", search);
      }
      if (this.sortParam) {
        list = _utils.sort(list, this.sortParam, this.sortOrder, false);
      }
      if (this.station.shortcode) {
        list = list.map((i) => {
          i.active = this.station.shortcode === i.shortcode ? true : false;
          return i;
        });
      }
      return list;
    },

    // filter songs list
    songsList() {
      let list = this.songs.slice();
      return list;
    },

    // sort-by label for buttons, etc
    sortLabel() {
      switch (this.sortParam) {
        case "title":
          return "Station Name";
        case "listeners":
          return "Listeners Count";
        case "favorite":
          return "Saved Favorites";
        case "genre":
          return "Music Genre";
      }
    },

    // check if audio can be played
    canPlay() {
      return this.station.shortcode && !this.loading ? true : false;
    },

    // check if a station is selected
    hasChannel() {
      return this.station.shortcode ? true : false;
    },

    // check if there are tracks loaded
    hasSongs() {
      return this.songs.length ? true : false;
    },

    // check for errors that would affect playback
    hasErrors() {
      if (this.errors.support || this.errors.stream) return true;
      if (this.errors.stations && !this.stations.length) return true;
      return false;
    },
  },

  // custom methods
  methods: {
    // run maintenance tasks on a timer
    setupMaintenance() {
      this.itv = setInterval(() => {
        this.getChannels(this.sidebar); // update stations
        this.getSongs(this.station); // update station tracks
      }, 1000 * 30);
    },

    // set an erro message
    setError(key, err) {
      let errors = Object.assign({}, this.errors);
      errors[key] = String(err || "").trim();
      if (err) console.warn("ERROR(" + key + "):", err);
      this.errors = errors;
    },

    // clear all error messages
    clearError(key) {
      let errors = Object.assign({}, this.errors);
      delete errors[key];
      this.errors = errors;
    },

    // check if an error has been set for a key
    hasError(key) {
      return key && this.errors.hasOwnProperty(key);
    },

    // flush all errors
    flushErrors() {
      this.errors = {};
    },

    // show player when app is mounted
    setupEvents() {
      document.addEventListener("visibilitychange", () => {
        this.visible = document.visibilityState === "visible";
      });
      window.addEventListener("hashchange", () =>
        this.applyRoute(window.location.hash)
      );
      window.addEventListener("keydown", this.onKeyboard);
      // audio related events
      _audio.on("waiting", this.onWaiting);
      _audio.on("playing", this.onPlaying);
      _audio.on("ended", this.onEnded);
      _audio.on("error", this.onError);
    },

    // hide spinner and show player
    initPlayer() {
      setTimeout(() => {
        document.querySelector("#_spnr").style.display = "none";
        document.querySelector("#player-wrap").style.opacity = "1";
        this.init = true;
      }, 100);
    },

    // reset selected station
    resetPlayer() {
      this.closeAudio();
      this.flushErrors();
      this.station = {};
      this.songs = [];
    },

    // try resuming stream problem if possible
    tryAgain() {
      if (this.hasError("support")) {
        this.flushErrors();
        setTimeout(this.setupAudio, 1);
      } else {
        this.flushErrors();
        this.playChannel(this.station);
      }
    },

    // show/hide the sidebar
    toggleSidebar(toggle) {
      const state = typeof toggle === "boolean" ? toggle : false;
      if (state) {
        this.sbActive = true; // bring to front
        this.sbVisible = true; // show drawer
        this.$refs.sidebarDrawer.focus();
      } else {
        this.sbVisible = false;
        setTimeout(() => {
          this.sbActive = false;
        }, 500);
      }
    },

    // toggle stream playback for current selected station
    togglePlay(e) {
      e && e.preventDefault();
      if (this.loading) return;
      if (this.playing) return this.closeAudio();
      this.playChannel(this.station);
    },

    // save volume to store
    saveVolume() {
      _store.set("player_volume", this.volume);
    },

    // load saved volume from store
    loadVolume() {
      const vol = parseInt(_store.get("player_volume")) || 80;
      this.volume = vol;
    },

    // load last sort options from store
    loadSortOptions() {
      const opts = _store.get("sorting_data");
      if (opts && opts.param) this.sortParam = opts.param;
      if (opts && opts.order) this.sortOrder = opts.order;
    },

    // toggle sort order
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },

    // apply sorting and toggle order
    sortBy(param, order) {
      if (this.sortParam === param) {
        this.toggleSortOrder();
      } else {
        this.sortOrder = order || "asc";
      }
      this.sortParam = param;
      _store.set("sorting_data", {
        param: this.sortParam,
        order: this.sortOrder,
      });
    },

    // load saved favs list from store
    loadFavorites() {
      const favs = _store.get("favorites_data");
      if (!Array.isArray(favs)) return;
      this.favorites = favs;
    },

    // save favs to a .m3u file
    saveFavorites() {
      let data = "#EXTM3U";
      for (let id of this.favorites) {
        const station = this.stations.filter((c) => c.shortcode === id).shift();
        if (!station) continue;
        data += "\n\n";
        data += `#EXTINF:0,${station.title} [AzuraCast]\n`;
        data += `${station.mp3file}`;
      }
      const elm = document.createElement("a");
      elm.setAttribute(
        "href",
        "data:audio/mpegurl;charset=utf-8," + encodeURIComponent(data)
      );
      elm.setAttribute("download", "azuracast_favorites.m3u");
      elm.setAttribute("target", "_blank");
      document.body.appendChild(elm);
      setTimeout(() => elm.click(), 100);
      setTimeout(() => elm.remove(), 1000);
    },

    // toggle favorite station by id
    toggleFavorite(id, toggle) {
      let favs = this.favorites.slice();
      favs = favs.filter((fid) => fid !== id);
      if (toggle) favs.push(id);
      this.favorites = favs;
      this.updateCurrentChannel();
      _store.set("favorites_data", favs);
    },

    // close active audio
    closeAudio() {
      _audio.stopAudio();
      this.playing = false;
    },

    // setup animation canvas
    setupCanvas() {
      _scene.setupCanvas();
    },

    // audio visualizer animation loop
    updateCanvas() {
      this.anf = requestAnimationFrame(this.updateCanvas);
      if (this.visible) {
        const freq = _audio.getFreqData(this.playing);
        _scene.updateObjects(freq);
      }
    },

    // get stations data from api
    getChannels(sidebar) {
      _api.getChannels((err, stations) => {
        if (err) return this.setError("stations", err);
        this.stations = stations;
        this.clearError("stations");
        this.updateCurrentChannel();
        this.applyRoute(window.location.hash, sidebar);
      });
    },

    // get songs list for a station from api
    getSongs(station, cb) {
      if (!station || !station.shortcode || !station.songsurl) return;
      if (!this.isCurrentChannel(station)) {
        this.songs = [];
        this.track = {};
        this.image = {};
      }

      _api.getSongs(station, (err, songs) => {
        if (err) return this.setError("songs", err);
        if (typeof cb === "function") cb(songs);
        this.track = songs.now_playing.song;
        this.songs = songs.song_history;
        this.image = songs.now_playing.song;
        this.clearError("songs");
        // console.log("DATA => ", this.songs);

        // get cover
        const a = this.track.artist.replace(/ *\([^)]*\) */g, "");
        const t = this.track.title.replace(/ *\([^)]*\) */g, "");

        this.getCover(a, t);
      });
    },

    // get album cover
    getCover(a, t) {
      this.itunes = {};
      var url =
        "https://itunes.apple.com/search?term==" +
        a +
        "-" +
        t +
        "&media=music&limit=1";
      url = encodeURI(url);
      axios
        .get(url)
        .then((response) => {
          if (response.data.results.length == 1) {
            var cover = response.data.results[0].artworkUrl100.replace(
              "100x100",
              "500x500"
            );
            this.itunes = { cover };
            console.log(
              "%c Cover found from iTunes!",
              "background:green; color: white;"
            );
          } else {
            this.itunes = this.image;
            console.log(
              "%c Cover not found: Get default:",
              "background: red; color: white;"
            );
          }
        })
        .catch((err) => {
          if (err) {
            console.log("Error data ===> ", err);
          }
        });
    },

    // checks is a station is currently selected
    isCurrentChannel(station) {
      if (!station || !station.shortcode || !this.station.shortcode)
        return false;
      if (this.station.shortcode !== station.shortcode) return false;
      return true;
    },

    // update data for current selected channel
    updateCurrentChannel() {
      for (let c of this.stations) {
        // see if channel has been saved as a favorite
        c.favorite = this.favorites.indexOf(c.shortcode) >= 0;
        // see if channel is currently selected
        if (this.isCurrentChannel(c)) {
          this.station = Object.assign(this.station, c);
          c.active = true;
        }
      }
    },

    // play audio stream for a station
    playChannel(station) {
      if (this.playing || !station || !station.mp3file) return;
      this.loading = true;
      _audio.playSource(station.mp3file);
      _audio.setVolume(this.volume);
    },

    // select a station to play
    selectChannel(station, play = false) {
      if (!station || !station.shortcode) return;
      if (this.isCurrentChannel(station)) return;
      this.closeAudio();
      this.toggleSidebar(false);
      this.setRoute(station.route);
      this.getSongs(station);
      this.station = station;
      // attempt to play only after user insteraction, triggered from clicking a station on the list
      if (play) {
        this.playChannel(station);
      }
    },

    // set station route
    setRoute(route) {
      route =
        "/" +
        String(route || "")
          .replace(/^[\#\/]+|[\/]+$/g, "")
          .trim();
      window.location.hash = route;
      this.route = route;
    },

    // parse url hash route actions
    applyRoute(route, sidebar = false) {
      const data = String(route || "")
        .replace(/^[\#\/]+|[\/]+$/g, "")
        .trim()
        .split("/");
      const action = data.length ? data.shift() : "";
      const param = data.length ? data.shift() : "";

      // select a station from the url
      if (action === "station" && param) {
        const station = this.stations
          .filter((c) => c.shortcode === param)
          .shift();
        if (station && station.shortcode) {
          return this.selectChannel(station);
        }
      }
      // nothing to do, reset player
      this.closeAudio();
      this.resetPlayer();
      this.toggleSidebar(sidebar);
    },

    // on keyboard events
    onKeyboard(e) {
      const k = e.key || "";
      if (k === " " && this.station.shortcode) return this.togglePlay();
      if (k === "Enter") return this.toggleSidebar(true);
      if (k === "Escape") return this.toggleSidebar(false);
    },

    // waiting for media to load
    onWaiting(e) {
      if (this.sto) clearInterval(this.sto);
      this.sto = setTimeout(() => this.onError(e), 10000);
      this.playing = false;
      this.loading = true;
    },

    // audio stream playing
    onPlaying(e) {
      this.clearError("stream");
      this.playing = true;
      this.loading = false;
    },

    // audio stream ended
    onEnded(e) {
      this.playing = false;
      this.loading = false;
    },

    // error loading stream
    onError(e) {
      this.closeAudio();
      this.setError(
        "stream",
        `The selected stream (${this.station.title}) could not load, or stopped loading due to network problems.`
      );
      this.playing = false;
      this.loading = false;
    },

    // start tracking playback time
    startClock() {
      this.stopClock();
      this.timeStart = Date.now();
      this.timeItv = setInterval(this.updateClock, 1000);
      this.updateClock();
    },

    // update tracking playback time
    updateClock() {
      let p = (n) => (n < 10 ? "0" + n : "" + n);
      let elapsed = (Date.now() - this.timeStart) / 1000;
      let seconds = Math.floor(elapsed % 60);
      let minutes = Math.floor((elapsed / 60) % 60);
      let hours = Math.floor(elapsed / 3600);
      this.timeDisplay = p(hours) + ":" + p(minutes) + ":" + p(seconds);
    },

    // stop tracking playback time
    stopClock() {
      if (this.timeItv) clearInterval(this.timeItv);
      this.timeItv = null;
    },

    // clear timer refs
    clearTimers() {
      if (this.sto) clearTimeout(this.sto);
      if (this.itv) clearInterval(this.itv);
      if (this.anf) cancelAnimationFrame(this.anf);
    },

    // pass height property to css
    setCssHeight(elm, height) {
      elm.style.setProperty("--height", `${height}px`);
    },

    // keep track of window height
    updateHeight() {
      let root = document.querySelector(":root");
      this.setCssHeight(root, window.innerHeight);
      window.addEventListener("resize", (e) =>
        this.setCssHeight(root, window.innerHeight)
      );
    },

    // ...
  },

  // on app mounted
  mounted() {
    this.loadSortOptions();
    this.loadFavorites();
    this.loadVolume();
    this.setupEvents();
    this.getChannels(true);
    this.setupCanvas();
    this.updateCanvas();
    this.setupMaintenance();
    this.updateHeight();
    this.initPlayer();
  },

  // on app destroyed
  destroyed() {
    this.closeAudio();
    this.clearTimers();
  },
});
