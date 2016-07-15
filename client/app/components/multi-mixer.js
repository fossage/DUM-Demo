// 'audio/stems/low_drums.mp3'

import {DUM} from '../../dum-core/dum';
import {mixer} from './mixer';
import {RaycasterPlane} from '../component-templates/RaycasterPlane';

export const multiMixer = DUM.Component((options) => {
  let node1 = mixer({audioUrl: 'audio/stems/low_drums.mp3', color: 'lawngreen'})
  .setStyles(_getStyles());
  
  let node2 = mixer({audioUrl: 'audio/stems/high.mp3', color: 'red'})
  .setStyles(_getStyles());
  
  let node3 = mixer({audioUrl: 'audio/stems/high_drums.mp3', color: 'aqua'})
  .setStyles(_getStyles());
  
  let node4 = mixer({audioUrl: 'audio/stems/bass.mp3', color: 'purple'})
  .setStyles(_getStyles());
  
  let rcp = new RaycasterPlane();
  rcp.animate();

  function _getStyles() {
    return {
      opacity: '0.7',
      zIndex: '2'
    }
  }

  return DUM.$div(node1, node2, node3, node4, rcp.node);
});