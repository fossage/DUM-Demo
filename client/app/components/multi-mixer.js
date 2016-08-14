// 'audio/stems/low_drums.mp3'

import {DUM}            from '../../dum-core/dum';
import {mixer}          from './mixer';
import {Reverb}         from '../component-templates/Reverb';
import {RaycasterPlane} from '../component-templates/RaycasterPlane';
// import {Mixer} from '../component-templates/Mixer';

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

    DUM.loadSVG('images/ephemera/effects.svg'),

    DUM.loadSVG('fonts/Entypo+/dots-two-horizontal.svg')
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

  // let mixer = new Mixer({
  //   audioCtx: audioCtx,
  //   source: 'audio/stems/high.mp3',
  //   processors: [{
  //     node: new Reverb(audioCtx),
  //     name: 'reverb'
  //   }]
  // });

  let instructions = DUM.$div(
    instructionItems.map((item) => {
      let className = item
      .toLowerCase()
      .split(' ')
      .join('-');

      return DUM.span.text(`${item}:`).setClass(className)
    })
  ).setClass('instructions-container', 'flex-parent', 'wrap', 'jc-center');

  let instructionsComp = DUM
  .div
  .setClass('instructions-comp')
  .setStyles({opacity: '0'});

  instructionsComp.on('didMount', () => {
    let rect = instructions.getBoundingClientRect();
    instructionsComp.wait(20)
    .then(() => {
      instructionsComp.setStyles({
        bottom: `${5 - rect.height}px`,
        opacity: '1'
      });
    });
  });

  return Promise.all(promises)
  .then((vals) => {
    let [node1, node2, node3, node4, effects] = vals;
    _attachEffects(effects, vals.slice(0,4));
    
    return DUM.$div(node1, node2, node3, node4, rcp.node, instructionsComp, effects)
    .setClass('create-container')
    .setStyles({height: `${window.innerHeight - 100}px`})
  });

  /*==============================================
                 PRIVATE FUNCTIONS
  ===============================================*/
  function _attachEffects(svgNode, audioNodes) {
    let svg = Snap(svgNode);
    
    let reverb        = svg.select('#reverb');
    let reverbKnob    = reverb.select('#knob');
    let reverbToggles = reverb.select('#toggles');
    let rtBlue        = reverbToggles.select('#blue');
    let rtGreen       = reverbToggles.select('#green');
    let rtRed         = reverbToggles.select('#red');
    let rtPurple      = reverbToggles.select('#purple');

    let delay        = svg.select('#delay');
    let delayKnob    = delay.select('#knob');
    let delayToggles = delay.select('#toggles');
    let dtBlue       = delayToggles.select('#blue');
    let dtGreen      = delayToggles.select('#green');
    let dtRed        = delayToggles.select('#red');
    let dtPurple     = delayToggles.select('#purple');

    reverbToggles.node.childNodes.forEach((node, idx) => {
      let n = DUM.decorateEl(node);
      let audio = audioNodes[idx];
      n.click(() => node.toggleClass('active'));
      
      // if(node.hasClass('active')) {
      //   audio.reverb.on();
      // }
    });

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