import {DUM}       from '../../dum-core/dum';
import {Gen}       from '../services/gen-service';

// let itm = {
//   title: 'Foo Artist',
//   fileName: 'foo.png',
//   linkTo: 'http://',
//   bio: 'ksdl lajsdflkjasl flk asjdflkjlas dfj asjfl j salkdfj salj fdlf jasl'
// };

export const Artists = DUM.Component((options = {}) => {
  let opts = Object.assign({
    items: [],
    template: () => {}, 
    containerClasses: ''
  }, options);

  let container = DUM.div.addClass(opts.containerClasses);

  for(let item of opts.items) {
    container.append(opts.template(item));
  }

  return container;
});