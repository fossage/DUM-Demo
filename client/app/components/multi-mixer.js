// 'audio/stems/low_drums.mp3'

import {DUM} from '../../dum-core/dum';
import {mixer} from './mixer';

export const multiMixer = DUM.Component((options) => {
  let node1 = mixer({audioUrl: 'audio/stems/low_drums.mp3'});
  let node2 = mixer({audioUrl: 'audio/stems/high.mp3'});

  return DUM.$div(node1, node2);
});