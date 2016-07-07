import {mainNav} from './components/main-nav-component';
import {DUM} from '../dum-core/dum';

require('./styles/main.scss');

//@todo: set this up in webpack.config
const ENV = 'development';

const ApiRoot = {
  develpment: 'localhost:1337',
  production: null
};

/*======== COMPONENT SETUP =======*/
let header = () => {
  let nav = mainNav({
    items: [
      {
        text: 'About',
        goTo: 'about'
      },
      
      {
        text: 'Artists',
        goTo: 'artists'
      },
      
      {
        type: 'div',
        classes: 'main-logo',
        goTo: 'artists'
      },
      
      {
        text: 'Videos',
        goTo: 'videos'
      },
      
      {
        text: 'Shows',
        goTo: 'shows'
      }
    ]
  });

  let logoContainer = DUM.figure.setClass('logo');

  return DUM.$header(
    logoContainer,
    nav
  ).setClass('main-header')
}

/*======== CONFIG =======*/
DUM.config([
  {
    name: 'HTTP',
    options: { serverRoot: `${ApiRoot[ENV]}/api`}
  },
  
  {
    name: 'Router',
    options: {
      root: { 
        name: 'root',
        path: '/', 
        view: header,
        redirectTo: 'artists'
      }
    }
  }
]);

