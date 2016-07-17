// 'audio/stems/low_drums.mp3'

import {DUM} from '../../dum-core/dum';
import {mixer} from './mixer';
import {RaycasterPlane} from '../component-templates/RaycasterPlane';

export const multiMixer = DUM.Component((options) => {
  let rcp = new RaycasterPlane();
  rcp.animate();
  
  let promises = [
    mixer({
      audioUrl: 'audio/stems/low_drums.mp3', 
      colorClass: 'red', 
      bufferInterceptor: (val) => rcp.updateYScale(val, 0)
    }),
    
    mixer({
      audioUrl: 'audio/stems/high.mp3', 
      colorClass: 'green',
      bufferInterceptor: (val) => rcp.updateYScale(val, 1)
    }),
    
    mixer({
      audioUrl: 'audio/stems/high_drums.mp3', 
      colorClass: 'blue',
      bufferInterceptor: (val) => rcp.updateYScale(val, 2)
    }),
    
    mixer({
      audioUrl: 'audio/stems/bass.mp3', 
      colorClass: 'purple',
      bufferInterceptor: (val) => rcp.updateYScale(val, 3)
    })
  ];

  return Promise.all(promises)
  .then((vals) => {
    
    let [node1, node2, node3, node4] = vals;
    return DUM.$div(node1, node2, node3, node4, rcp.node);
  })

  function _getStyles() {
    return {
      opacity: '0.7',
      zIndex: '2'
    }
  }

 
});