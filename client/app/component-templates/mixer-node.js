'use strict';
import {DUM} from '../../dum-core/dum';
import {Reverb} from './Reverb';
import {Mixer} from './Mixer';


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentTime = 0;
let startTime = 0;
let controlNodeId;

export class MixerNode {
  constructor(audioUrl, bufferInterceptor, startingGain) {
    this.isPlaying     = false;
    this.gain        = 0;
    this.panPosition = 0;
    this.id          = audioUrl;

    DUM.loadArrayBuffer(audioUrl)
    .then((data) => {
      audioCtx.decodeAudioData(data, (buffer) => {
        this.gainNode   = audioCtx.createGain();
        this.gainNode.gain.value = startingGain || 0.5;

        this.panNode    = audioCtx.createStereoPanner();
        
        // this.reverb     = Reverb(audioCtx);
        // this.reverb.wet = 2;
        // // this.reverb.on  = _on;
        // // this.reverb.off = _off;
        
        this.scriptNode = audioCtx.createScriptProcessor();
        
        this.buffer     = buffer;
        this.isPlaying  = false;
        
        this.gainNode.connect(this.panNode);
        this.panNode.connect(this.scriptNode);
        // this.reverb.connect();

        this.processors = {
          in: this.gainNode,
          out: this.scriptNode
        };

        this.scriptNode.onaudioprocess = (e) => {
          let inputBuffer  = e.inputBuffer;
          let outputBuffer = e.outputBuffer;
          
          for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            let inputData  = inputBuffer.getChannelData(channel);
            let outputData = outputBuffer.getChannelData(channel);
            let total      = 0;
            let len        = inputData.length;

            for (let sample = 0; sample < inputBuffer.length; sample++) {
              // make output equal to the same as the input
              outputData[sample] = inputData[sample];
              
              if(bufferInterceptor) { 
                total += Math.abs( inputData[sample] )
                let rms = Math.sqrt( total / len ) * 50; 
                bufferInterceptor(rms);
              }
            }
          }
          
          if(!startTime) startTime = performance.now();
          currentTime = performance.now();
          
          if(((currentTime - startTime) / 1000) >= this.buffer.duration) {
            startTime += (this.buffer.duration * 1000);
          }
        };

        function _on() {
          
        }

      });
    });
  }

  stop() {
    this.source[this.source.stop ? 'stop': 'noteOff'](0);
    this.isPlaying = false;
  }

  play() {
    _play(this);
    this.isPlaying = true;
  }

  togglePlayback(time) {
    if (this.isPlaying) {
      // Stop playback
      this.source[this.source.stop ? 'stop': 'noteOff'](0);
    } else {
      _play(this);
    }
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  adjustGain(val) {
    this.gainNode.gain.value = val * val;
  }

  adjustPan(val) {
    this.panNode.pan.value = val;
  }
}

function _play(that) {
  that.source        = audioCtx.createBufferSource();
  that.source.buffer = that.buffer;
  that.source.loop   = true;
  
  that.source.connect(that.processors.in);
  that.processors.out.connect(audioCtx.destination);
  
  that.source[that.source.start ? 'start' : 'noteOn'](0, (currentTime - startTime) / 1000);
}