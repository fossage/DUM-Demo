'use strict';
import {DUM} from '../../dum-core/dum';

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export class MixerNode {
  constructor(audioUrl) {
    this.isPlaying     = false;
    this.gain        = 0;
    this.panPosition = 0;
    
    // let audioNode   = DUM.audio.setSrc(opts.trackUrl);
    // let audioSource = audioCtx.createMediaElementSource(audioNode);

    let init = {
      method: 'GET',
      headers: {'Content-Type': 'arraybuffer'},
      mode: 'cors'
    };

    fetch(audioUrl, init)
    .then((response) => {
      response.arrayBuffer()
      .then((data) => {
        audioCtx.decodeAudioData(data, (buffer) => {
          this.gainNode  = audioCtx.createGain();
          this.panNode   = audioCtx.createStereoPanner();
          
          this.buffer    = buffer;
          this.isPlaying = false;
          this.gainNode.gain.value = 0.5;
          
          // this.panNode.connect();
        });
      });
    });
  }

  togglePlayback(time) {
    if (this.isPlaying) {
      // Stop playback
      this.source[this.source.stop ? 'stop': 'noteOff'](0);
    } else {
      this.source        = audioCtx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop   = true;
      this.source.connect(this.panNode);
      this.panNode.connect(this.gainNode);
      this.gainNode.connect(audioCtx.destination);
      this.source[this.source.start ? 'start' : 'noteOn'](time || 0);
    }
    this.isPlaying = !this.isPlaying;
  }

  adjustGain(val) {
    this.gainNode.gain.value = val * val;
  }

  adjustPan(val) {
    this.panNode.pan.value = val;
  }
}