'use strict';
/*=======================================
            IMPORTS/EXPORTS
=======================================*/
import {Component}            from './factories/component';
import {Service}              from './factories/service';
import {_behaviors, Behavior} from './factories/behavior';
import {DecorateEl}           from './factories/decorate-el';
import {Loader}               from './factories/Loader';

import {
  traverseNodes, 
  callNodesEventCallbacks, 
  createEvent, 
  elementsToArray
} from './utils/element'

/*=======================================
            CLASS DEFINITION
=======================================*/
export class DUM extends Loader {
  static Service (name, serviceObject) {
    return Service(name, serviceObject);
  }

  static Component(defaultConstructor) {
    return Component(defaultConstructor);
  }

  static Behavior(name, func) {
    return Behavior(name, func);
  }
  
  static registerComponent(elementName, templateId, shadowHost) {
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

  static decorateEl(el) {
    return DecorateEl(el);
  }

  static publish(eventName, data) {
    let e = createEvent(eventName, data);
    document.dispatchEvent(e);
  }

  static createEl(elName) {
    let el          = document.createElement(elName);
    let decoratedEl = DecorateEl(el);

    return decoratedEl;
  }

  // This is the main method for attaching our document fragments to the actual DOM
  static attach(...args) {
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

  static getObservable() {
    let obj        = {};
    let _watchHash = {};
    let watch      = _watchGenerator(obj);
    
    watch.next();
    let prox  = _proxyObservable(obj, watch, _watchHash);
    prox.observe = (prop, cb) => _watchHash[prop] = cb;

    return prox;
  }

  static observe (obj, watchHash) {
    let watch = _watchGenerator(obj);
    watch.next();
    let binder = _proxyObservable(obj, watch, _watchHash);
    return binder;
  }

  static getSVG(path, raw) {
    return Loader.getSVG(path, raw);
  }

  static getHTML(path, raw) {
    return Loader.getHTML(path, raw);
  }
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
