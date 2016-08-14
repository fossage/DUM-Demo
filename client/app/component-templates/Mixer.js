'use strict';
import {DUM} from '../../dum-core/dum';
/**
 * options = {
 *   audioCtx: {},
 *   tracks: [
 *     {name: 'drums', source: 'audio/drums'},
 *     {name: 'guitar1', source: buffer}
 *   ],  
 *   processors: []
 * }
 */


/**
 * At this point, what the mixer needs to do is take in a group of tracks which the user will
 * provide names for, add pre/post gain and panning controls to them, as well as take in a 
 * group of processors which it will add the same controls to as well as wet/dry gain. Ideally we 
 * would be able to then apply any of the processors to each track individually or to groups of tracks
 * via a bus system.  The mixer should also have play/pause/stop and ff/rw/scrub controls.
 */
/*========================================
            CLASS DEFINITION
========================================*/
export class Mixer {
  constructor(options) {
    this._processors = {};
    this._tracks     = {};
    this.tracks      = {};
    this.audioCtx    = options.audioCtx || (window.AudioContext || window.webkitAudioContext)();       

    // lets put some defense up against accidental overwrites on these bad boys
    Object.defineProperties(this._processors, {
      source: {
        readable: true,
        writable: false,
        configurable: true,
        value: {
          node: this.audioCtx.createBufferSource(),
          next: null,
          prev: null,
          name: 'source'
        }
      },

      dest: {
        readable: true,
        writable: false,
        configurable:true,
        value: {
          node: this.audioCtx.destination,
          next: null,
          prev: null,
          name: 'dest'
        }
      }
    });

    if(options.tracks && options.tracks.length) {
      this._numChannels     = options.tracks.length;
      this._numTracksLoaded = 0;

      options.tracks.forEach(track => {
        _setUpTrack.call(this, track, options.onLoadingComplete);
      });
    }

    // if we are initializing the class with some effects, set those dudes up
    if(options.processors && options.processors.length) {
      options.processors.forEach(data => {
        _setUpProcessor.call(this, data, this.audioCtx);
      });
    }
  }

  adjustPreGain(amount, addToCurrent) {
    _handleInput(output, 'gain', amount, addToCurrent)
  }

  play() {
    if(!this.startTime) this.startTime = performance.now();
    Object.keys(this.tracks).forEach(key => this.tracks[key]._play(this.startTime));
  }

  pause() {

  }

}

/*========================================
                 HELPERS
========================================*/
function _setUpTrack(data, onLoadingComplete = ()=>{/*noop*/}) {
  let name     = data.name;
  let audioCtx = this.audioCtx;
  let preGain  = audioCtx.createGain();
  let postGain = audioCtx.createGain();
  let pan      = audioCtx.createGain();

  if(typeof data.source === 'string') {
    DUM.loadArrayBuffer(data.source)
    .then(audioData => {
      this.audioCtx.decodeAudioData(audioData, buffer => {
        _setUpTrackNode.call(this, buffer, name, audioCtx, preGain, postGain, pan);
        _handleLoaded.call(this, data, onLoadingComplete);
      });
    });

  // Otherwise, if we already have a loaded buffer, use that
  } else if (_isArrayBuffer(data.source)) {
    _setUpTrackNode.call(this, data.source, name, audioCtx, preGain, postGain, pan);
    _handleLoaded.call(this, data, onLoadingComplete);
  }
}

function _handleLoaded(data, onLoadingComplete) {
  this._numTracksLoaded++;
  if(data.onLoad) data.onLoad(buffer);
  if(this._numTracksLoaded === this._numChannels) onLoadingComplete();
}

function _setUpTrackNode(track, name, audioCtx, preGain, postGain, pan) {
  let that = this;

  that.tracks[name] = {
    source: audioCtx.createBufferSource(),
    isPlaying: false,
    connected: false,
    muted: false,
    preGain: preGain,
    postGain: postGain,
    pan: pan,
    
    toggleMute() {
      if(!this.muted) {
        postGain._preMuteValue = postGain.gain.value;
        postGain.gain.value    = 0;
        this.muted             = true; 
      } else {
        postGain.gain.value    = postGain._preMuteValue;
        postGain._preMuteValue = null;
        this.muted             = false;
      }
    },

    adjustPreGain(amount, addToCurrent) {
      _handleInput(preGain, 'gain', amount, addToCurrent);
      console.log(this);
    },

    adjustPostGain(amount, addToCurrent) {
      _handleInput(postGain, 'gain', amount, addToCurrent);
    },

    adjustPan(amount, addToCurrent) {
      _handleInput(pan, 'pan', amount, addToCurrent);
    },

    // For internal use. Should only be trigged by mixer's master 'play' method
    _play(startTime) {
      if(!this.connected){
        this.connected     = true;
        this.source.buffer = track;
        this.source.connect(preGain);
        preGain.connect(pan);
        pan.connect(postGain);
        postGain.connect(audioCtx.destination);
      }
      
      let offSet = Math.round((performance.now() - startTime) / 1000);
      (this.source.start || this.source.noteOn).call(this.source, offSet);
    }
  };
}

/**
 *       input
 *         |
 *     |-------|
 *    wet     dry
 *     |       |
 *  processor  |
 *     |       |
 *   wetPan  dryPan
 *      \     /
 *       \   /
 *       output
 */
function _setUpProcessor(data, audioCtx) {
  let wetGain = audioCtx.createGain();
  let dryGain = audioCtx.createGain();
  let wetPan  = audioCtx.createStereoPanner();
  let dryPan  = audioCtx.createStereoPanner();

  let name = data.name;

  this._processors.source.node.connect(dryGain);
  this._processors.source.node.connect(wetGain);
  wetGain.connect(data.node);
  data.node.connect(wetPan);
  dryGain.connect(dryPan);
  wetPan.connect(this._processors.dest.node);
  dryPan.connect(this._processors.dest.node);

  // this._processors is where we hold the metadata 
  // necessary to make  our linked list of effects.
  // We initialize it here if it hasn't been already.
  if(!this._processors[name]) this._processors[name] = {};
 
  // this[name] is the publicly exposed portion
  this._processors[name].node = this[name] = data.node;

  // Monkey patch connect/disconnect methods
  this[name]._connect    = this[name].connect; 
  this[name]._disconnect = this[name].diconnect;
  
  this[name].connect  = connectee => {
    let connecteeName = connectee.name;
    if(!this._processors[connecteeName]) _setUpProcessor(connectee);
    _removeIfPresent(connectee, this._processors);
    _spliceIn(connectee, this[name], this._processors);
  }

  this[name].disconnect = disconnectee => {
    let disconnecteeName = disconnectee;
    return _spliceOut(disconnectee, this._processors, this.audioCtx);
  }

  Object.defineProperties(this[name], {
    dry: {
      value: (amount, addToCurrent) => _handleInput(dry, 'gain', amount, addToCurrent)
    },

    wet: {
      value: (amount, addToCurrent) => _handleInput(wet, 'gain', amount, addToCurrent)
    },

    master: {
      value: (amount, addToCurrent) => _handleInput(output, 'gain', amount, addToCurrent)
    },

    preGain: {
      value: (amount, addToCurrent) => _handleInput(input, 'gain', amount, addToCurrent)
    },

    wetPan: {
      value: (amount, addToCurrent) => _handleInput(wetPan, 'pan', amount, addToCurrent)
    },

    dryPan: {
      value: (amount, addToCurrent) => _handleInput(dryPan, 'pan', amount, addToCurrent)
    }
  });
}

/*========================================
            PRIVATE FUNCTIONS
========================================*/
function _handleInput(node, param, amount, addToCurrent){
  if(!amount) return node[param].value;
  if(addToCurrent) node[param].value += amount;
  if(!addToCurrent) node[param].value = amount;
}

function _removeIfPresent(node, store) {
  let name = _getNodeName(node);
  if(name in store) return _spliceOut(node);
  return false;
}

function _spliceOut(name, store, audioCtx) {
  let node = store[name];
  if(node && node.prev && node.next) {
    let prev = node.prev.node;
    let next = node.next.node;
    
    prev._disconnect(node);
    prev._connect(next);

    node.next.prev = node.prev;
    node.prev.next = node.next;

    return node;
  } else {
    let message = 'No audio ';
    if(!node.prev && !node.next) message += 'source and destination nodes have been connected';
    if(!node.prev)               message += 'source node has been connected';
    if(!node.next)               message += 'destination node has been connected';
    throw new Error(message);
  }
}

function _spliceIn(storeItem, after, store) {
  let afterNode = store[after];
  if(afterNode.name === 'dest') throw new Error('Cannot connect a processor after the audio destination node');
  
  let prev       = afterNode.prev;
  let next       = afterNode.next;
  prev.next      = storeItem;
  storeItem.prev = prev;
  next.prev      = storeItem;
  storeItem.next = next;
  
  prev.node._disconnect(afterNode.node);
  afterNode._disconnect(next.node);
  prev.node._connect(storeItem.node);
  storeItem.node._connect(next.node);
}

function _getNodeName(node) {
  return node[Symbol.toStringTag].split('Node')[0].toLowerCase();
}

function _isArrayBuffer(item) {
  return item.constructor === ArrayBuffer;
}