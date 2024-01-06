/**
 * Audio handler object
 */
export default {
  mContext: null,
  mAudio: null,
  mSource: null,
  mGain: null,
  mAnalyser: null,
  mFreq: new Uint8Array(32),
  mHasfreq: false,
  mCounter: 0,
  mEvents: {},

  // setup audio routing, called after user interaction, setup once
  setupAudio() {
    if (this.mAudio && this.mContext) return;

    this.mAudio    = new Audio();
    this.mContext  = new (window.AudioContext || window.webkitAudioContext)();
    this.mSource   = this.mContext.createMediaElementSource(this.mAudio);
    this.mAnalyser = this.mContext.createAnalyser();
    this.mGain     = this.mContext.createGain();

    this.mAnalyser.fftSize = 32;
    this.mSource.connect(this.mAnalyser);
    this.mSource.connect(this.mGain);
    this.mGain.connect(this.mContext.destination);

    this.mAudio.addEventListener('canplay', () => {
      this.mFreq = new Uint8Array(this.mAnalyser.frequencyBinCount);
      this.mAudio.play();
    });

    ['waiting', 'playing', 'ended', 'stalled', 'error'].forEach(event => {
      this.mAudio.addEventListener(event, e => this.emit(event, e));
    });
  },

  // add event listeners to the audio api
  on(event, callback) {
    if (event && typeof callback === 'function') {
      this.mEvents[event] = callback;
    }
  },

  // emit saved audio event
  emit(event, data) {
    if (event && this.mEvents.hasOwnProperty(event)) {
      this.mEvents[event](data);
    }
  },

  // update and return analyser frequency value (0-1) to control animations
  getFreqData(playing) {
    if (!this.mAnalyser) return 0;

    // this is not working on some devices running safari
    this.mAnalyser.getByteFrequencyData(this.mFreq);
    let mFreq = Math.floor(this.mFreq[4] | 0) / 255;

    // indicate that a freq value can be read
    if (!this.mHasfreq && mFreq) { this.mHasfreq = true; }

    // frequency data available
    if (this.mHasfreq) return mFreq;

    // return fake counter if no freq data available (safari workaround)
    if (playing) {
      this.mCounter = (this.mCounter < .6) ? (this.mCounter + .01) : this.mCounter;
    } else {
      this.mCounter = (this.mCounter > 0) ? (this.mCounter - .01) : this.mCounter;
    }
    return this.mCounter;
  },

  // set audio volume
  setVolume(volume) {
    if (!this.mGain) return;
    volume = parseFloat(volume) || 0;
    volume = (volume > 1) ? (volume / 100) : volume;
    volume = (volume > 1) ? 1 : volume;
    volume = (volume < 0) ? 0 : volume;
    this.mAudio.muted = (volume <= 0) ? true : false;
    this.mGain.gain.value = volume;
  },

  // stop playing audio
  stopAudio() {
    if (!this.mAudio) return;
    try { this.mAudio.pause(); } catch (e) {}
    try { this.mAudio.stop(); } catch (e) {}
    try { this.mAudio.close(); } catch (e) {}
  },

  // play audio source url
  playSource(source) {
    this.setupAudio();
    this.stopAudio();

    if (this.mContext.state === 'suspended') {
      this.mContext.resume().then(() => {
        console.log('Audio context has been resumed.');
      });
    }
    this.mAudio.src = String(source || '') + '?x=' + Date.now();
    this.mAudio.preload = 'metadata';
    this.mAudio.crossOrigin = 'anonymous';
    this.mAudio.autoplay = false;
    this.mAudio.load();
  },

}
