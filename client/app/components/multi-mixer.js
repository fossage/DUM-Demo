// 'audio/stems/low_drums.mp3'

import {DUM} from '../../dum-core/dum';
import {mixer} from './mixer';
import {RaycasterPlane} from '../component-templates/RaycasterPlane';

export const multiMixer = DUM.Component((options) => {
  let rcp = new RaycasterPlane(() => {
    return DUM.Router.current.name !== 'create' || DUM.Router.to.name !== 'create';
  });

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
    }),

    DUM.getSVG('images/ephemera/effects.svg')
    .then(_handleSVGLoad),

    DUM.getSVG('fonts/Entypo+/dots-two-horizontal.svg')
    .then(_handleIconLoad)
  ];
   
  let instructionItems = [
    'Forward', 
    'Back', 
    'Left', 
    'Right', 
    'Up', 
    'Down',
    'Roll Left',
    'Roll Right',
    'Pitch Up',
    'Pitch Down',
    'Yaw Left',
    'Yaw Right'
  ];
  


  let instructions = DUM.$div(
    instructionItems.map((item) => {
      let className = item
      .toLowerCase()
      .split(' ')
      .join('-');

      return DUM.span.text(`${item}:`).setClass(className)
    })
  ).setClass('instructions-container', 'flex-parent', 'wrap', 'jc-center');

let instructionsComp = DUM.div.setClass('instructions-comp');

  return Promise.all(promises)
  .then((vals) => {
    
    let [node1, node2, node3, node4, effects] = vals;
    return DUM.$div(node1, node2, node3, node4, rcp.node, instructionsComp, effects)
    .setClass('create-container')
    .setStyles({height: `${window.innerHeight - 100}px`})
  });
  function _handleSVGLoad(svgNode) {
    let svg = Snap(svgNode);
    let reverb = svg.select('#reverb');
    let delay = svg.select('#delay');

    return DUM.$div(svg.node).setClass('effects');
  }

  function _handleIconLoad(svgNode) {
    return instructionsComp.append(
      DUM.$div(
        DUM.h3.text('Controls')
        .append(
          DUM.$span(svgNode).setClass('icon')
        ).setClass('flex-parent', 'jc-center', 'ai-center')
      ).setClass('controls-tab')
      .click(() => {
        instructionsComp.toggleClass('open');
      }),
      instructions
    )
  }
});