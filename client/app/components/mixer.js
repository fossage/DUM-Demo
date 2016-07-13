import {DUM} from '../../dum-core/dum';
import {MixerNode} from '../component-templates/mixer-node';

export const mixer = DUM.Component((options) => {

  let xPos      = 0;
  let yPos      = 0;
  let xElem     = 0;
  let yElem     = 25;
  let mixerNode = new MixerNode(options.audioUrl);
  let container = DUM.div;

  let button = DUM
  .button
  .text('Play')
  .mouseDown((el) => {
    let downTime = new Date().getTime();
    el.text('Stop');
    el.mouseMove(moveEl);
    el.mouseOut(() => el.off('mousemove', moveEl));

    el.mouseUp(() => {
      let upTime = new Date().getTime();
      if(upTime - downTime < 200) {
        mixerNode.togglePlayback(0);
        el.text('Stop');
      }

      el.off('mousemove', moveEl);
    });

    
  }).setStyles({padding: '5em', backgroundColor: options.color || 'purple'})
  
  container.append(
    button
  ).setStyles({position: 'absolute', top: 25, display: 'inline-block'});

  container.wait(500)
  .then(() => {
    xElem = xPos - button.offsetLeft;
    yElem = yPos - button.offsetTop;
  });

  function moveEl(el, e) {
    let rawPercentageY = (window.innerHeight - e.clientY) / (window.innerHeight - 100);
    let gainVal = Math.floor(rawPercentageY * 100) / 100;
    let panVal;
    
    let steroCenter =  window.innerWidth / 2;
    
    if(e.clientX < steroCenter) {
      panVal = -((steroCenter + 1 - e.clientX) / steroCenter)
    } else {
      panVal = (e.clientX + 1 - steroCenter) / steroCenter;
    }

    mixerNode.adjustPan(panVal);
    mixerNode.adjustGain(gainVal);
    
    xPos = e.clientX - el.clientWidth / 2;
    yPos = e.clientY - el.clientHeight / 2;
    container.style.top = `${yPos - yElem}px`;
    container.style.left = `${xPos - xElem}px`
  }

  return container;  
});