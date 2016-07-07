import {DUM} from '../../dum-core/dum';

const stopButtonPath = 'M48,51.9905081 C48,49.7866113 49.7920882,48 51.9905081,48 L111.009492,48 C113.213389,48 115,49.789262 115,52.007608 L115,77.492392 C115,79.7057328 115,83.289262 115,85.507608 L115,110.992392 C115,113.205733 113.207912,115 111.009492,115 L51.9905081,115 C49.7866113,115 48,113.207912 48,111.009492 L48,51.9905081 Z';

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const audioPlayer = DUM.Component((options) => {
// let worker =  new Worker('web-workers/process-audio.js');
  
  // OPTIONS SETUP
  let opts = Object.assign({
    svgPath: '',
    trackUrl: '',
    onPlay: () => {},
    onStop: () => {}
  }, options);
  
  // VARIABLE INITIALIZATION
  let bbox;
  let playing     = false;
  let WIDTH       = 640;
  let HEIGHT      = 360;
  let SMOOTHING   = 0.5;
  let FFT_SIZE    = 2048;
  let vol         = 0;
  let freqs       = 0;
  let audioNode   = DUM.audio.setSrc(opts.trackUrl);
  let audioSource = audioCtx.createMediaElementSource(audioNode);
  let canvas      = DUM.canvas;
  let svg;

  // METHOD ASSIGNMENT
  VisualizerSample.prototype.togglePlayback    = togglePlayback;
  VisualizerSample.prototype.draw              = draw;
  VisualizerSample.prototype.getFrequencyValue = getFrequencyValue;

  return DUM.getSvg(opts.svgPath)
  .then((svgNode) => {
    // SVG REFERENCE SETUP
    svg                = Snap(svgNode);
    let o              = svg.select('#o');
    let playButton     = svg.select('#play-button');
    let icon           = playButton.select('#icon');
    let playButtonPath = icon.node.attributes[0].nodeValue;
    let mainCirc       = playButton.select('#main-circle');
    let indicator1     = playButton.select('#indicator-1');
    let indicator2     = playButton.select('#indicator-2');
    let indicator3     = playButton.select('#indicator-3');
    let indicator4     = playButton.select('#indicator-4');
    let indicator5     = playButton.select('#indicator-5');
    let visualizer     = new VisualizerSample();

    svgNode.on('didMount', ()=> { bbox = o.getBBox(); });
    
    svg.click(() => {
      _togglePlayState(icon, playButtonPath);
      visualizer.togglePlayback();

      if(playing) {
        _rotateButton(indicator1, 1000);
        _rotateButton(indicator2, 1300, true);
        _rotateButton(indicator3, 1600);
        _rotateButton(indicator4, 1900, true);
        _rotateButton(indicator5, 2200);
        opts.onPlay(true);
      } else {
        indicator1.stop();
        indicator2.stop();
        indicator3.stop();
        indicator4.stop();
        indicator5.stop();
        opts.onStop(false);
      }
    });

    return DUM.$div(svgNode, canvas);
  });
  
  
  function _rotateButton(indicator, timing, reverse) {
    let r = reverse ? 'r-360' : 'r360';
    indicator.stop().animate({
      transform: `${r},${bbox.cx},${bbox.cy},s1,1`
    }, timing, mina.easinout, () => { 
      indicator.attr({transform: `rotate(0 ${bbox.cx} ${bbox.cy})`})
      _rotateButton(indicator, timing) 
    });
  }

  function _togglePlayState(icon, playButtonPath){ 
    let path = !playing ? stopButtonPath : playButtonPath;
    icon.stop().animate({d: path}, 300, mina.linear);
    playing = !playing;
  }

  function VisualizerSample() {
    this.analyser   = audioCtx.createAnalyser();

    let init = {
      method: 'GET',
      headers: {'Content-Type': 'arraybuffer'},
      mode: 'cors'
    };

    fetch(opts.trackUrl, init)
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

  function togglePlayback() {
    if (this.isPlaying) {
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

  function draw() {
    this.analyser.fftSize               = FFT_SIZE;
    this.analyser.smoothingTimeConstant = SMOOTHING;

    // Get the frequency data from the currently playing music
    this.analyser.getByteFrequencyData(this.freqs);
    this.analyser.getByteTimeDomainData(this.times);

    let width       = Math.floor(1/this.freqs.length, 10);
    let drawContext = canvas.getContext('2d');
    canvas.width    = WIDTH;
    canvas.height   = HEIGHT;

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

  function getFrequencyValue(freq) {
    let nyquist = context.sampleRate/2;
    let index   = Math.round(freq/nyquist * this.freqs.length);
    return this.freqs[index];
  }
});