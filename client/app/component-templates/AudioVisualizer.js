'use strict';
import {DUM} from '../../dum-core/dum';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const WIDTH       = 640;
const HEIGHT      = 360;
const SMOOTHING   = 0.5;
const FFT_SIZE    = 2048;
const vol         = 0;
const freqs       = 0;

export class AudioVisualizer {
  constructor({trackUrl}){
    this.analyser   = audioCtx.createAnalyser();
    this.canvas      = DUM.canvas;

    let init = {
      method: 'GET',
      headers: {'Content-Type': 'arraybuffer'},
      mode: 'cors'
    };

    fetch(trackUrl, init)
    .then((response) => {
      response.arrayBuffer()
      .then((data) => {
        audioCtx.decodeAudioData(data, (buffer) => {
          this.buffer = buffer;
          this.analyser.connect(audioCtx.destination);
          this.analyser.minDecibels = -140;
          this.analyser.maxDecibels = 0;
          this.freqs                = new Uint8Array(this.analyser.frequencyBinCount);
          this.times                = new Uint8Array(this.analyser.frequencyBinCount);
          this.isPlaying            = false;
          this.startTime            = 0;
          this.startOffset          = 0;
        });
      });
    });
  }

  togglePlayback(stop) {
    if (this.isPlaying || stop) {
      // Stop playback
      this.source[this.source.stop ? 'stop': 'noteOff'](0);
      this.startOffset += audioCtx.currentTime - this.startTime;
      // Save the position of the play head.
    } else {
      this.startTime = audioCtx.currentTime;
      this.source    = audioCtx.createBufferSource();
      // Connect graph
      this.source.connect(this.analyser);
      this.source.buffer = this.buffer;
      this.source.loop   = true;
      // Start playback, but make sure we stay in bound of the buffer.
      this.source[this.source.start ? 'start' : 'noteOn'](0, this.startOffset % this.buffer.duration);
      // Start visualizer.
      window.requestAnimationFrame(this.draw.bind(this));
    }
    this.isPlaying = !this.isPlaying;
  }

  draw() {
    this.analyser.fftSize               = FFT_SIZE;
    this.analyser.smoothingTimeConstant = SMOOTHING;

    // Get the frequency data from the currently playing music
    this.analyser.getByteFrequencyData(this.freqs);
    this.analyser.getByteTimeDomainData(this.times);

    let width          = Math.floor(1/this.freqs.length, 10);
    let drawContext    = this.canvas.getContext('2d');
    this.canvas.width  = WIDTH;
    this.canvas.height = HEIGHT;

    // Draw the frequency domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      let value    = this.freqs[i];
      let percent  = value / 256;
      let height   = HEIGHT * percent;
      let offset   = HEIGHT - height - 1;
      let barWidth = WIDTH / this.analyser.frequencyBinCount;
      let hue      = i / this.analyser.frequencyBinCount * 360;

      drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      drawContext.fillRect(i * barWidth, offset, barWidth, height);
    }

    // Draw the time domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      let value    = this.times[i];
      let percent  = value / 256;
      let height   = HEIGHT * percent;
      let offset   = HEIGHT - height - 1;
      let barWidth = WIDTH / this.analyser.frequencyBinCount;

      drawContext.fillStyle = 'white';
      drawContext.fillRect(i * barWidth, offset, 1, 3);
    }

    if (this.isPlaying) window.requestAnimationFrame(this.draw.bind(this));
  }

  getFrequencyValue(freq) {
    let nyquist = context.sampleRate/2;
    let index   = Math.round(freq/nyquist * this.freqs.length);
    return this.freqs[index];
  }
}