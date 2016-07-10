'use strict';
/*=======================================
            IMPORTS/EXPORTS
=======================================*/
import {curry} from '../utils/functional';

import {
  traverseNodes, 
  callNodesEventCallbacks, 
  createEvent, 
  handlePotentialMount,
  elementsToArray
} from '../utils/element';

export const DecorateEl = (function() {
  let uid = 0;

  return (el) => {
    if(el.$uid) return el;

    Object.defineProperties(el, {
      $uid: {
        writable: false,
        value: ++uid
      },

      $$mounted: {
        value: false,
        enumerable: false,
        writable: true,
        readable: true,
        configurable: true
      },

      $$eventCallbacks: {
        value: {},
        enumerable: false,
        writable: true,
        readable: true,
        configurable: true
      },

      // @todo: Make this use the touchstart event when using mobile
      touchStart: {
        value: _setUpHandler('click', el)
      },

      touchEnd: {
        value: _setUpHandler('touchend', el)
      },

      click: {
        value: _setUpHandler('click', el)
      },

      mouseDown: {
        value: _setUpHandler('mouseDown', el)
      },

      mouseUp: {
        value: _setUpHandler('mouseUp', el)
      },

      change : {
        value: _setUpHandler('change', el)
      },

      mouseOver: {
        value: _setUpHandler('mouseover', el)
      },

      mouseOut: {
        value: _setUpHandler('mouseout', el)
      },

      keyDown: {
        value: _setUpHandler('keydown', el)
      },

      keyUp: {
        value: _setUpHandler('keyup', el)
      },

      keyPress: {
        value: _setUpHandler('keypress', el)
      },

      scroll: {
        value: _setUpHandler('scroll', el)
      },

      hover: {
        value: _bindElToFunc(el, hover)
      },

      // sets up listeners for component specific events such as lifecycle callbacks
      on: {
        value: _bindElToFunc(el, on)
      },

      behavior: {
        value: _bindElToFunc(el, behavior)
      },

      // appends components to current component and calls their 'willMount' lifecycle callbacks
      append: {
        value: _bindElToFunc(el, append)
      },

      prepend: {
        value: _bindElToFunc(el, prepend)
      },

      // 'updates' a component by creating a new one with the new 
      // options passed in and replacing the old one in the DOM
      update: {
        value: _bindElToFunc(el, update)
      },

      wait: {
        value: _bindElToFunc(el, wait)
      },
      
      empty: {
        value: _bindElToFunc(el, empty)
      },

      remove: {
        value: _bindElToFunc(el, remove)
      },

      setClass: {
        value: _bindElToFunc(el, setClass)
      },

      removeClass: {
        value: _bindElToFunc(el, removeClass)
      },

      toggleClass: {
        value: _bindElToFunc(el, toggleClass)
      },

      setId: {
        value: _bindElToFunc(el, setId)
      },

      // Sets styles for the element in a stylesheet rather than on the component itself
      // to allow for overwrites via a css file and/or other components. Inline styles
      // can still be set by passing true for the 'inline' argument
      setStyles: {
        value: _bindElToFunc(el, setStyles)
      },

      text: {
        value: _bindElToFunc(el, text)
      },

      publish: {
        value: _bindElToFunc(el, publish)
      },

      subscribe: {
        value: _bindElToFunc(el, subscribe)
      },
      
      attr: {
        value: _bindElToFunc(el, attr)
      },

      setSrc: {
        value: _bindElToFunc(el, setSrc)
      },

      // makes the element become a shadow host for native web components
      shadow: {
        value: _bindElToFunc(el, shadow)
      }
    });

    return el;
  };

  /*===========================================
                METHOD DEFINITIONS
  ===========================================*/
  function hover (el, enterCb, leaveCb) {
    if(!enterCb || !leaveCb){
      console.warn('Hover handler requires both an enter and a leave callback as arguments.'); 
      return el;
    } 

    if(!el.$$eventCallbacks.onmouseover) el.$$eventCallbacks.onmouseover = [];
    if(!el.$$eventCallbacks.onmouseout) el.$$eventCallbacks.onmouseout = [];
    el.$$eventCallbacks.onmouseover.push(enterCb.bind(el, el));
    el.$$eventCallbacks.onmouseout.push(leaveCb.bind(el, el));

    el.onmouseover = () => {
      el.$$eventCallbacks.onmouseover.forEach((cb) => {
        cb();
      });
    }

    el.onmouseout = () => {
      el.$$eventCallbacks.onmouseout.forEach((cb) => {
        cb();
      });
    }

    return el;
  }

  function append(el, ...args) {
    let fragment = document.createDocumentFragment();

    [...args].forEach((childEl) => {
      if(childEl){
        childEl = elementsToArray(childEl);
        
        childEl.forEach((elem) => {
          if(!elem.$$mounted){
            traverseNodes(elem, (node) => callNodesEventCallbacks(node, 'willMount'));
            fragment.appendChild(elem);
          }
        });

        el.appendChild(fragment);
        handlePotentialMount(el);
      }
    });

    return el;
  }

  function on(el, eventName, cb) {
    let cbs;
    if(cb.constructor === Array) {
      cb.forEach((cb) => { cb.bind(el, el); });
      cbs = cb 
    } else if(typeof cb === 'function') {
      cb.bind(el, el);
      cbs = [cb];
    } else {
      throw new TypeError('Argument must be a function or array of functions');
    }

    if(el.$$eventCallbacks[eventName]) {
      el.$$eventCallbacks[eventName] = el.$$eventCallbacks[eventName].concat(cbs);
    } else {
      el.$$eventCallbacks[eventName] = cbs;
    }

    return el;
  }

  function behavior(el, name, opts) {
    _behaviors[name](el, opts);
    return el;
  }

  function prepend(el, ...args) {
    let fragment = document.createDocumentFragment();;
    let argsArray = [...args];

    for(let i = argsArray.length - 1; i >= 0; i--) {
      let childEl = argsArray[i];

      if(childEl) {
        childEl = elementsToArray(childEl);

        childEl.forEach((elem) => {
          if(!elem.$$mounted){
            traverseNodes(elem, curry(callNodesEventCallbacks, 'willMount'));
            fragment.appendChild(elem);
          }
        });
        
        el.insertBefore(fragment, el.childNodes[0]);
      }

      handlePotentialMount(el);
    }

    return el;
  }

  function update (el, options) {
    let comp = el.$constructor(options);
    try{
      el.parentNode.replaceChild(comp, el);
      return el;
    } catch(e){
      console.warn('Cant update element because no parent was found');
      return el;
    }
  }

  function wait (el, ms) {
    return new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        resolve(el);
      }, ms);
    });
  }

  function empty (el) {
    try {
      for(let i = el.childNodes.length -1; i > -1; i--){
        let node = el.childNodes[i];
        traverseNodes(node, callNodesEventCallbacks, 'willUnMount');
        let removedEl =  el.removeChild(node);
        traverseNodes(node, curry(callNodesEventCallbacks, 'didUnMount'));
        node.$$mounted = false;

        if(node.$$eventCallbacks){
          Object.keys(node.$$eventCallbacks).forEach((key) => {
            node.$$eventCallbacks[key].forEach((cb) => {
              node.removeEventListener(key, cb);
            });
          });
        }
      }
    } catch (e) {
      console.warn(e);
      return el;
    }
  }

  function remove (el) {
    let parent = el.parentNode;

    try {
      traverseNodes(el, curry(callNodesEventCallbacks, 'willUnMount'));
      let removedEl =  parent ? parent.removeChild(el) : el;
      traverseNodes(el, curry(callNodesEventCallbacks, 'didUnMount'));
      el.$$mounted = false;

      // Tear down listeners
      Object.keys(el.$$eventCallbacks).forEach((key) => {
        el.$$eventCallbacks[key].forEach((cb) => {
          el.removeEventListener(key, cb);
        });
      });

      return removedEl;
    } catch(e) {
      console.warn(e);
      return el;
    }
  }

  function setClass (el, ...args) {
    if(el.classList && args[0]) {
      if(args.length > 1)  {
        el.classList.add(...args);
      } else {
        let classes = [...args][0].split(' ');
        el.classList.add(...classes);
      }
    }
  
    return el;
  }

  function removeClass (el, ...args) {
    el.classList.remove(...args);
    return el;
  }

  function toggleClass (el, className) {
    el.classList.toggle(className);
    return el;
  }

  function setId(el, id) {
    el.id = id;
    return el;
  }

  function setStyles(el, rules = {}, inline) {
    if(inline) {
      Object.keys(rules).forEach((key) => {
        let cssKey = key.split(/(?=[A-Z])/).join("-");
        el.attr('style', `${cssKey}:${rules[key]}`)
      });
      
      return el;
    }

    let styleEl = null;
    let compClass = `component-${el.$uid}`;
    el.setClass(compClass);

    if(document.styleSheets.length) {
      styleEl = document.styleSheets[document.styleSheets.length - 1];
    } else {
      styleEl = document.createElement('style').sheet;
      document.head.appendChild(styleEl); 
    }

    let styleSheet = styleEl;
    let rule = `.${compClass} {\n`;

    Object.keys(rules).forEach((key) => {
      // @todo: figure out all values for blacklist
      let pxBlacklist = ['font-weight', 'opacity'];
      let value = rules[key];
      let cssKey = key.split(/(?=[A-Z])/).join("-");
      
      if(typeof value === 'number' && pxBlacklist.indexOf(cssKey) === -1) {
        value = value + 'px';
      }

      rule += `${cssKey}: ${rules[key]};\n`;
    });

    rule += '}';

    let index = styleSheet.cssRules ? styleSheet.cssRules.length : 0;
    styleSheet.insertRule(rule, index);

    return el;
  }

  function text (el, txt) {
    el.innerText = txt;
    return el;
  }

  function publish(el, eventName, data) {
    let e = createEvent(eventName, data);
    el.dispatchEvent(e);
    
    return el;
  }

  function subscribe(el, name, cb) {
    window.addEventListener(name, function(e) {
      cb.call(el, e, e.detail.data);
    });
    
    return el;
  }

  function attr(el, key, val) {
    if(!val){
      return el.getAttribute(key);
    } else {
      el.setAttribute(key, val);
      return el;
    }
  }

  function setSrc(el, src) {
    el.src = src;
    return el;
  }

  function shadow(el, templateId) {
    let link     = document.querySelector('link[rel="import"]' + templateId + '-comp');
    let template = link.import.querySelector(templateId);
    let root     = el.createShadowRoot();
    let clone    = document.importNode(template.content, true);

    root.appendChild(clone);
    return el;
  }

  /*===========================================
              PRIVATE FUNCTIONS 
  ===========================================*/
  function _bindElToFunc(el, func) {
    return func.bind(el, el);
  }

  function _setUpHandler(name, el) {
    return (cb) => {
      if(!cb) return el;
      if (typeof cb !== 'function') throw new TypeError(`Argument to ${name} must be a function`);

      let domName = `on${name.toLowerCase()}`;
      if(!el.$$eventCallbacks[domName]) el.$$eventCallbacks[domName] = [];
      el.$$eventCallbacks[domName] = el.$$eventCallbacks[domName].concat([(cb.bind(el, el))]);

      el[domName] = (e) => {
        el.$$eventCallbacks[domName].forEach((cb) => {
          cb(e);
        });
      }

      return el;
    };
  }
}());