import {DUM} from '../../dum-core/dum';
import {Mixer} from '../component-templates/Mixer';

const AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();

export const mixingConsole = DUM.Component(() => {
  let deferred = new Promise((resolve, reject) => {
    let mixContainer      = DUM.div.setClass('mix-container');
    let controlsContainer = DUM.div.setClass('controls-container');

    let mixer = new Mixer({
      audioCtx: AUDIOCTX,
      tracks: [
        {
          source: 'audio/stems/bass.mp3',
          name: 'bass'
        },
        {
          source: 'audio/stems/high.mp3',
          name: 'high'
        },
        {
          source: 'audio/stems/high_drums.mp3',
          name: 'highDrums'
        },
        {
          source: 'audio/stems/low_drums.mp3',
          name: 'lowDrums'
        }
      ],
      onLoadingComplete: _handleLoadingComplete
    });

    function _handleLoadingComplete() {
      let trackNames = Object.keys(mixer.tracks);
      trackNames.forEach(name => controlsContainer.append(_makeFader(mixer.tracks[name])));
      resolve(mixContainer.append(controlsContainer));
    }
  });

  return deferred;
});

function _makeFader(track) {
  let faderContainer = DUM.div.setClass('fader-container');
  let faderKnob      = DUM.div.setClass('fader-knob');
  let faderTrack     = DUM.$div(faderKnob).setClass('fader-track');

  faderKnob.mouseDown(() => {
    // let pos = faderTrack.getBoundingClientRect();
    faderTrack.mouseMove(_handleMove);
    
    faderTrack.mouseUp(() => {
      faderTrack.off('mousemove', _handleMove);
    });

    // faderTrack.mouseOut(() => {
    //   faderTrack.off('mousemove', _handleMove);
    // });
  });

  function _handleMove(el, e) {
    let pos = faderTrack.getBoundingClientRect();
    if(e.clientY < pos.bottom && e.clientY > pos.top) {
      faderKnob.style.bottom = `${(pos.bottom - e.clientY - 10)}px`;
    }
  }

  return faderTrack;
}