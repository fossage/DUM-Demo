'use strict';
/*=======================================
            IMPORTS/EXPORTS
=======================================*/
import {Component}            from './factories/component';
import {Service}              from './factories/service';
import {_behaviors, Behavior} from './factories/behavior';
import {DecorateEl}           from './factories/decorate-el';

import {
  traverseNodes, 
  callNodesEventCallbacks, 
  createEvent, 
  elementsToArray
} from './utils/element'

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
    value: DecorateEl
  },

  attach: {
    value: attach
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
    get: getObservable
  },

  observe: {
    value: observe
  }
});

/*=======================================
            METHOD DEFINITIONS
=======================================*/
function publish(eventName, data) {
  let e = createEvent(eventName, data);
  document.dispatchEvent(e);
}

function createEl(elName) {
  let el          = document.createElement(elName);
  let decoratedEl = DecorateEl(el);

  return decoratedEl;
}

function registerComponent(elementName, templateId, shadowHost) {
  let CustomElement   = document.registerElement(elementName);
  let link            = document.querySelector(`link[rel="import"]${templateId}-comp`);
  let template        = link.import.querySelector(templateId).innerHTML;
  let component       = DecorateEl(new CustomElement());
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

// Main method to attatch DOM fragments to the actual DOM.
// Typically just used for the root component and everything else
// is appended to some subset of that.
function attach(...args) {
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
            callNodesEventCallbacks(node, 'didMount', node.$$mounted, true)
          });
          
          elem.$$mounted = true;
        }
      });
    }
  });
  
  return element;
}

function getObservable() {
  let obj        = {};
  let _watchHash = {};
  let watch      = _watchGenerator(obj);
  
  watch.next();
  let prox  = _proxyObservable(obj, watch, _watchHash);
  prox.observe = (prop, cb) => _watchHash[prop] = cb;

  return prox;
}

function observe (obj, watchHash) {
  let watch = _watchGenerator(obj);
  watch.next();
  let binder = _proxyObservable(obj, watch, _watchHash);
  return binder;
}

/*=======================================
                HELPERS
=======================================*/
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
