'use strict';
/*=======================================
            IMPORTS/EXPORTS
=======================================*/
import {Component} from './factories/component';
import {Service} from './factories/service';
import {_behaviors, Behavior} from './factories/behavior';
import {curry} from './utils/functional';

import {
  traverseNodes, 
  callNodesEventCallbacks, 
  createEvent, 
  handlePotentialMount,
  elementsToArray
} from './utils/element'

/*=======================================
            METHOD DEFINITIONS
=======================================*/
// @todo - Figure out a nice way to attach this to the DUM namespace, or ditch it
// entirely becaues using html goes against the grain of the framework
function registerComponent(elementName, templateId, shadowHost) {
  let CustomElement   = document.registerElement(elementName);
  let link            = document.querySelector(`link[rel="import"]${templateId}-comp`);
  let template        = link.import.querySelector(templateId).innerHTML;
  let component       = decorateEl(new CustomElement());
  component.innerHTML = template;

  if (shadowHost !== null) {
    let host = document.querySelector(shadowHost);
    let root = host.createShadowRoot();
    root.appendChild(component);
  } else {
    document.body.appendChild(component);
  }

  return component;
}

function createEl(elName) {
  let el          = document.createElement(elName);
  let decoratedEl = decorateEl(el);

  return decoratedEl;
}

// @todo - should we expose decorateEl? Seems like it should be a private function
let decorateEl = (function() {
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
        value: (enterCb, leaveCb) => {
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
      },

      // sets up listeners for component specific events such as lifecycle callbacks
      on: {
        value: (eventName, cb) => {
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
      },

      behavior: {
        value: (name, opts) => {
          _behaviors[name](el, opts);
          return el;
        }
      },

      // appends components to current component and calls their 'willMount' lifecycle callbacks
      append: {
        value: (...args) => {
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
      },

      prepend: {
        value: (...args) => {
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
      },

      // 'updates' a component by creating a new one with the new 
      // options passed in and replacing the old one in the DOM
      update: {
        value: (options) => {
          let comp = el.$constructor(options);
          try{
            el.parentNode.replaceChild(comp, el);
            return el;
          } catch(e){
            console.warn('Cant update element because no parent was found');
            return el;
          }
        }
      },

      wait: {
        value: (ms) => {
          return new Promise((resolve, reject) => {
            let id = setTimeout(() => {
              resolve(el);
            }, ms);
          });
        }
      },
      
      empty: {
        value: () => {
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
      },

      remove: {
        value: () => {
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
      },

      setClass: {
        value: (...args) => {
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
      },

      removeClass: {
        value: (...args) => {
          el.classList.remove(...args);
          return el;
        }
      },

      toggleClass: {
        value: (className) => {
          el.classList.toggle(className);
          return el;
        }
      },

      setId: {
        value: (id) => {
          el.id = id;
          return el;
        }
      },

      // Sets styles for the element in a stylesheet rather than on the component itself
      // to allow for overwrites via a css file and/or other components. Inline styles
      // can still be set by passing true for the 'inline' argument
      setStyles: {
        value: (rules = {}, inline) => {
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
      },

      text: {
        value: (txt) => {
          el.innerText = txt;
          return el;
        }
      },

      publish: {
        value: function(eventName, data) {
          let e = createEvent(eventName, data);
          el.dispatchEvent(e);
          
          return el;
        }
      },

      subscribe: {
        value: function(name, cb) {
          window.addEventListener(name, function(e) {
            cb.call(el, e, e.detail.data);
          });
          
          return el;
        }
      },
      
      attr: {
        value: (key, val) => {
          if(!val){
            return el.getAttribute(key);
          } else {
            el.setAttribute(key, val);
            return el;
          }
        } 
      },

      setSrc: {
        value: (src) => {
          el.src = src;
          return el;
        }
      },

      // makes the element become a shadow host for native web components
      shadow: {
        value: function(templateId) {
          let link     = document.querySelector('link[rel="import"]' + templateId + '-comp');
          let template = link.import.querySelector(templateId);
          let root     = el.createShadowRoot();
          let clone    = document.importNode(template.content, true);

          root.appendChild(clone);
          return el;
        }
      }
    });

    return el;
  };

  /*===========================================
              PRIVATE FUNCTIONS 
  ===========================================*/
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

export const DUM = {};

/*=======================================
         METHOD/PROPS ASSIGNMENT
=======================================*/

Object.defineProperties(DUM, {
  registerComponent: {
    value: registerComponent
  },
  
  createEl: {
    value: createEl
  },
  
  decorateEl: {
    value: decorateEl
  },

  attach: {
    // Main method to attatch DOM fragments to the actual DOM.
    // Typically just used for the root component and everything else
    // is appended to some subset of that.
    value: (...args) => {
      let fragment = DUM.decorateEl(document.createDocumentFragment());
      
      [...args].forEach((arg) => {
        if(arg) {
          arg = elementsToArray(arg);
          arg.forEach((elem) => fragment.append(elem)); 
        }
      });
      
      let element = document.body.appendChild(fragment);
      
      // here we call any 'didMount' lifecycle callbacks for each element being attached
      [...args].forEach((arg) => {
        if(arg) {
          arg = elementsToArray(arg);
          
          arg.forEach((elem) => {
            if(!elem.$$mounted){
              
              traverseNodes(elem, (node) => { 
                callNodesEventCallbacks(node, 'didMount', node.$$mounted)
              });
              
              elem.$$mounted = true;
            }
          });
        }
      });
      
      return element;
    }
  },
  
  setGlobalStyles: {
    value: (rules) => document.body.setStyles(rules)
  },

  getSvg: {
    value: getSvg
  },

  publish: {
    value: publish
  },
  
  Component: {
    value: Component
  },
  
  Service: {
    value: Service
  },

  Behavior: {
    value: Behavior
  },

  Observable: {
    get: () => {
      let obj        = {};
      let _watchHash = {};
      let watch      = _watchGenerator(obj);
      
      watch.next();
      let prox  = _proxyObservable(obj, watch, _watchHash);
      prox.observe = (prop, cb) => _watchHash[prop] = cb;

      return prox;
    }
  },

  observe: {
    value:(obj, watchHash) => {
      let watch = _watchGenerator(obj);
      watch.next();
      let binder = _proxyObservable(obj, watch, _watchHash);
      return binder;
    }
  }
});

/*================== METHOD DEFINITIONS =================*/
function publish(eventName, data) {
  let e = createEvent(eventName, data);
  document.dispatchEvent(e);
}

function getSvg(path) {
  let init = { 
    method: 'get',
    headers: {'Content-Type': 'image/svg+xml'},
    mode: 'cors',
    cache: 'default' 
  };

  return fetch(path, init)
  .then((response) => {
    return response.text()
    .then((svgString) => {
      let tempEl       = DUM.div;
      tempEl.innerHTML = svgString;
      let svg          = tempEl.querySelector('svg');
      return DUM.decorateEl(svg);
    });
  });
}

/*================== HELPERS =================*/
function* _watchGenerator(objct) {
  let prevObj = objct;
  let current;

  while(true) {
    current     = yield;
    let handler = yield;

    if(prevObj[current.key] && prevObj[current.key] !== current.val){
      handler(current.val, prevObj[current.key]);
    }

    prevObj[current.key] = current.val;
  }
}

function _proxyObservable(obj, watch, _watchHash) {
  return new Proxy(obj, {
    set: (target, prop, value, receiver) => {
      if(_watchHash[prop]) {
        watch.next({key: prop, val: value});
        watch.next(_watchHash[prop]);
      }
      
      target[prop] = value;

      return true;
    },
  });
}
