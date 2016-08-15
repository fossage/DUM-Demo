import {DUM} from '../../dum-core/dum';
import {MixerNode} from '../component-templates/mixer-node';
let zIndex = 102;
let left = 0;

export const mixer = DUM.Component((options) => {

  return DUM.loadSVG('images/ephemera/audio-button.svg')
  .then((svgNode) => {
    let svg = Snap(svgNode);
    let xPos;
    let yPos;
    let mixerNode = new MixerNode(options.audioUrl, options.bufferInterceptor, 0.92);
    let container = DUM.div.addClass('audio-node-container').setStyles({zIndex: '101'});

    let button = svg.node
    .mouseDown((el) => {
      container.style['z-index'] = ++zIndex;
      el.addClass('grabbing');
      let downTime = new Date().getTime();
      el.mouseMove(moveEl);
      el.mouseOut(() => el.off('mousemove', moveEl));

      el.mouseUp(() => {
        let upTime = new Date().getTime();
        el.removeClass('grabbing');
        
        if(upTime - downTime < 200) {
          mixerNode.togglePlayback(0);
          el.toggleClass('playing');
        }

        el.off('mousemove', moveEl);
      });
    });

    button.subscribe('stateChangeStart', () => mixerNode.stop());
    button.addClass(options.colorClass);

    container.append(
      button
    ).setStyles({position: 'absolute', top: 25, display: 'inline-block'});

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
      
      xPos = Math.round(e.clientX - el.clientWidth / 2);
      yPos = Math.round(e.clientY - 100 - el.clientHeight / 2);
      container.style.top = `${yPos}px`;
      container.style.left = `${xPos}px`
    }

    container.style.left = `${left}px`;
    left += 120;
    
    return container;  
  });
});