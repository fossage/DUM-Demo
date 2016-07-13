// 'audio/stems/low_drums.mp3'

import {DUM} from '../../dum-core/dum';
import {mixer} from './mixer';

export const multiMixer = DUM.Component((options) => {
  let node1 = mixer({audioUrl: 'audio/stems/low_drums.mp3', color: 'green'});
  let node2 = mixer({audioUrl: 'audio/stems/high.mp3', color: 'red'});
  let node3 = mixer({audioUrl: 'audio/stems/high_drums.mp3', color: 'blue'});
  let node4 = mixer({audioUrl: 'audio/stems/bass.mp3', color: 'orange'});

  return DUM.$div(node1, node2, node3, node4);
});