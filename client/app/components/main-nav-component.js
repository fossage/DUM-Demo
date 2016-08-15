import {DUM}       from '../../dum-core/dum';
import {HTTP}      from '../services/http-service';
import {NavButton} from '../component-templates/nav-button';

export let mainNav = DUM.Component((options) => {
  
  /*=========== ELEMENT SETUP ============*/
  let navList  = [];
  let group    = null;
  let mainNav  = DUM.ul.addClass('flex-parent', 'jc-space-around', 'wrap', 'ai-center');

  options.items.forEach((item) => {
    let basicItem = DUM[item.type || 'li'].addClass(item.classes);

    item.type === 'li'
      ? basicItem.append(DUM.a.text(item.text)) 
      : basicItem.append(DUM.span.text(item.text || ''));
  
    if(item.goTo)    basicItem.click(() => { DUM.Router.goTo({ name:item.goTo} )});
    if(item.append)  basicItem.append(item.append);
    if(item.onClick) basicItem.click(item.onClick);
    
    basicItem.subscribe('stateChangeEnd', (e, data) => {
      data.name === item.goTo
        ? basicItem.addClass('current-state')
        : basicItem.removeClass('current-state');
    });
    
    navList.push(basicItem.addClass('flex-1', 'nav-item'));
  });
  
  mainNav.append(navList);

  /*=========== COMPONENT CONSTRUCTION ============*/
  let navBar = DUM
  .$div(
    DUM.$nav(mainNav)
  ).addClass('nav-wrapper', 'clearfix');
  
  navBar.on('didMount', () => {
    navBar.setStyles({height: `${mainNav.clientHeight}px`}, true);
  });

  return navBar;
});