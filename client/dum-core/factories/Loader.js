'use strict';
import {convertStringToEl} from '../utils/element';

export class Loader {
  static getSVG(path, raw) {
    let svgPromise = _load(path, 'image/svg+xml');
    if(!raw) return svgPromise.then((str) => {
      return convertStringToEl(str, 'svg');
    });

    return svgPromise;
  }

  static getHTML(path, raw) {
    let htmlPromise = _load(path, 'text/html');
    if(!raw) return htmlPromise.then(convertStringToEl);
    return htmlPromise;
  }

}

let responseType = {
  'image/svg+html': 'text',
  'image/svg+xml': 'text',
  'text/html': 'text',
  'text/css': 'text',
  'application/json': 'json',
}

function _load(path, contentType) {
  let init = { 
    method: 'get',
    headers: {'Content-Type': contentType},
    mode: 'no-cors',
    cache: 'default' 
  };

  return fetch(path, init)
  .then((response) => {
    return response[responseType[contentType]]()
  });
}

