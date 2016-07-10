'use strict';

export function traverseNodes(node, cb) {
  if(cb) cb(node);

  if(node.childNodes && node.childNodes.length) {
    Object.keys(node.childNodes).forEach((key) => traverseNodes(node.childNodes[key], cb));
  }
}

export function callNodesEventCallbacks(node, event, exception) {
  if(node.$$eventCallbacks && node.$$eventCallbacks[event] && !exception) {
    node.$$eventCallbacks[event].forEach((cb) => cb());
  }
}

export function elementsToArray(item) {
  if(item.constructor !== Array && item.constructor !== HTMLCollection) {
    item = [item];
  }

  return [].slice.call(item);
}

export function createEvent(eventName, data, options = {}) {
  return  new CustomEvent(eventName, {
    detail: { data: data }, 
    bubbles: options.bubbles || true, 
    cancelable: options.cancelable || false
  });
}

// check if we are appending to an already mounted piece of the document
// and call lifecycle callbacks if applicable
export function handlePotentialMount(el) {
  let parent = el.parentNode;
  while(parent) {
    if(parent.$$mounted) {
      traverseNodes(parent, (node) => {
        if(!node.$$mounted) {
          callNodesEventCallbacks(node, 'didMount');
          node.$$mounted = true;
        }
      });
      
      break;
    }
    parent = parent.parentNode;
  }
  return el;
}

export const decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();