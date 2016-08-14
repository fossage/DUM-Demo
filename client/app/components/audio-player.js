import {DUM}             from '../../dum-core/dum';
import {AudioVisualizer} from '../component-templates/AudioVisualizer';

const stopButtonPath = 'M48,51.9905081 C48,49.7866113 49.7920882,48 51.9905081,48 L111.009492,48 C113.213389,48 115,49.789262 115,52.007608 L115,77.492392 C115,79.7057328 115,83.289262 115,85.507608 L115,110.992392 C115,113.205733 113.207912,115 111.009492,115 L51.9905081,115 C49.7866113,115 48,113.207912 48,111.009492 L48,51.9905081 Z';

export const audioPlayer = DUM.Component((options) => {  
  // OPTIONS SETUP
  let opts = Object.assign({
    svgPath: '',
    trackUrl: '',
    onPlay: () => {},
    onStop: () => {}
  }, options);
  
  // VARIABLE INITIALIZATION
  let svg;
  let bbox;
  let playing    = false;
  let visualizer = new AudioVisualizer({trackUrl: opts.trackUrl})
  let canvas     = visualizer.canvas;

  return DUM.loadSVG(opts.svgPath)
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

    svgNode.on('didMount', ()=> { bbox = o.getBBox(); });
    svgNode.subscribe('stateChangeStart', () => visualizer.togglePlayback.call(visualizer, true));

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
});