import {DUM} from '../../dum-core/dum';
import {Mixer} from '../component-templates/Mixer';

const AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();

export const mixingConsole = DUM.Component(() => {
  let deferred = new Promise((resolve, reject) => {

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
      onLoadingComplete: () => { 
        _setUpElements(mixer, resolve);
      }
    });
  });

  return deferred;
});

/************************************
 *      HELPERS/PRIVATE FUNCTIONS
 ***********************************/
function _setUpElements(mixer, resolve) {
  let mixContainer           = DUM.div.addClass('mix-container');
  let controlsContainer      = DUM.div.addClass('controls-container');
  let trackControlsContainer = DUM.div.addClass('track-controls-container');
  let trackNames             = Object.keys(mixer.tracks);
  let playButton             = _makePlayButton(mixer);

  trackNames.forEach((name) => {
    trackControlsContainer.append(_makeControlStrip(mixer, mixer.tracks[name]))
  });

  let comp = mixContainer.append(
    trackControlsContainer,
    playButton
  );

  resolve(comp);
}

function _makePlayButton(mixer) {
  let button = DUM.div.text('Play').addClass('play-button');
  button.click(() => mixer.play());
  return button;
}

function _makePanControl(track) {
  // @todo: Remake this in SVG and hook up event handling.
  // Just a dummy control for now.
  let knob  = DUM.div.addClass('pan-knob');
  return knob;
}

function _makeMuteButton(track) {
  let button = DUM.button.addClass('mute-button').text('Mute');

  button.click(() => {
    let text = button.text();
    button.toggleClass('active');
    button.text(text === 'Mute' ? 'Unmute' : 'Mute');
    track.toggleMute();
  });

  return button;
}

function _makeControlStrip(mixer, track) {
  let controlStrip = DUM.div.addClass('control-strip');
  
  controlStrip.append(
    _makeFader(track, controlStrip),
    _makePanControl(track),
    _makeMuteButton(track)
  );
  
  return controlStrip;
}

function _makeFader(track, container) {
  /*=========== Element Setup ==========*/
  let faderContainer = DUM.div.addClass('fader-container');
  let faderKnob      = DUM.div.addClass('fader-knob');
  let faderTrack     = DUM.$div(faderKnob).addClass('fader-track');

  track.adjustPostGain(0);
  
  /*=========== _makeFader Helpers ==========*/
  const __handleMouseMove = (el, e) => {
    let pos = container.getBoundingClientRect();
    if(e.clientY < pos.bottom && e.clientY > pos.top) {
      let level = (pos.bottom - e.clientY) / pos.height;
      track.adjustPostGain(level)
      faderKnob.style.bottom = `${(pos.bottom - e.clientY - 10)}px`;
    }
  }

  const __handleMouseUp = () => {
    faderTrack.off('mousemove', __handleMouseMove);
  }
  
  /*=========== Event Setup ==========*/
  faderKnob.mouseDown(() => {
    faderTrack.mouseMove(__handleMouseMove);
    faderTrack.mouseUp  (__handleMouseUp);
  });

  return faderTrack;
}