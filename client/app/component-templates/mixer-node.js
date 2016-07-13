'use strict';
import {DUM} from '../../dum-core/dum';

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentTime = 0;
let startTime = 0;
let controlNodeId;

export class MixerNode {
  constructor(audioUrl) {
    this.isPlaying     = false;
    this.gain        = 0;
    this.panPosition = 0;
    this.id          = audioUrl;

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
          this.gainNode   = audioCtx.createGain();
          this.panNode    = audioCtx.createStereoPanner();
          this.scriptNode = audioCtx.createScriptProcessor();
          this.buffer     = buffer;
          this.isPlaying  = false;
          this.gainNode.gain.value = 0.5;
          
          this.scriptNode.onaudioprocess = (e) => {
            let inputBuffer = e.inputBuffer;
            let outputBuffer = e.outputBuffer;
            for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
              var inputData = inputBuffer.getChannelData(channel);
              var outputData = outputBuffer.getChannelData(channel);

              for (var sample = 0; sample < inputBuffer.length; sample++) {
                // make output equal to the same as the input
                outputData[sample] = inputData[sample];
              }
            }
            if(!startTime) startTime = performance.now();
            currentTime = performance.now();
            if(((currentTime - startTime) / 1000) > this.buffer.duration) {
              startTime += (this.buffer.duration * 1000);
            }
          };
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

      this.source.connect(this.scriptNode);
      this.scriptNode.connect(this.panNode);
      this.panNode.connect(this.gainNode);
      this.gainNode.connect(audioCtx.destination);
      this.source[this.source.start ? 'start' : 'noteOn'](0, (currentTime - startTime) / 1000);
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