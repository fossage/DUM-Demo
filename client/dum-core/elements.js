'use strict';

import {DUM} from './dum';
import {curry} from './utils/functional';
import {traverseNodes, callNodesEventCallbacks} from './utils/element'

document.body = DUM.decorateEl(document.body);

Object.defineProperties(DUM, {

  a: {
    get: () => {
      let a = DUM.createEl('a');
      
      a.setHref = (link) => {
        a.setAttribute('href', link);
        return a;
      }
      
      return a;
    }
  },
  
  p: {
    get: () => DUM.createEl('p')
  },
  
  h1:  {
    get: () => DUM.createEl('h1')
  },
  
  h2:  {
    get: () => DUM.createEl('h2')
  },
  
  h3:  {
    get: () => DUM.createEl('h3')
  },
  
  h4:  {
    get: () => DUM.createEl('h4')
  },
  
  h5:  {
    get: () => DUM.createEl('h5')
  },
  
  h6:  {
    get: () => DUM.createEl('h6')
  },
  
  ul:  {
    get: () => DUM.createEl('ul')
  },
  
  ol: {
    get: () => DUM.createEl('ol')
  },
  
  li: {
    get: () => DUM.createEl('li')
  },
  
  div: {
    get: () => DUM.createEl('div')
  },
  
  img: {
    get: () => DUM.createEl('IMG')
  },
  
  small: {
    get: () => DUM.createEl('small')
  },
  
  footer: {
    get: () => DUM.createEl('footer')
  },
  
  header: {
    get: () => DUM.createEl('header')
  },
  
  hgroup: {
    get: () => DUM.createEl('hgroup')
  },
  
  nav: {
    get: () => DUM.createEl('nav')
  },
  
  dd: {
    get: () => DUM.createEl('dd')
  },
  
  dl: {
    get: () => DUM.createEl('dl')
  },
  
  dt: {
    get: () => DUM.createEl('dt')
  },
  
  figcaption: {
    get: () => DUM.createEl('figcaption')
  },
  
  figure: {
    get: () => DUM.createEl('figure')
  },
  
  hr: {
    get: () => DUM.createEl('hr')
  },
  
  main: {
    get: () => DUM.createEl('main')
  },
  
  pre: {
    get: () => DUM.createEl('pre')
  },

  svg: {
    get: () => {
      let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      return DUM.decorateEl(svg);
    }
  },
  
  abbr: {
    get: () => DUM.createEl('abbr')
  },
  
  b: {
    get: () => DUM.createEl('b')
  },
  
  bdi: {
    get: () => DUM.createEl('bdi')
  },
  
  bdo: {
    get: () => DUM.createEl('bdo')
  },
  
  br: {
    get: () => DUM.createEl('br')
  },
  
  cite: {
    get: () => DUM.createEl('cite')
  },
  
  code: {
    get: () => DUM.createEl('code')
  },
  
  data: {
    get: () => DUM.createEl('data')
  },
  
  dfn: {
    get: () => DUM.createEl('dfn')
  },
  
  em: {
    get: () => DUM.createEl('em')
  },
  
  i: {
    get: () => DUM.createEl('i')
  },
  
  kdb: {
    get: () => DUM.createEl('kdb')
  },
  
  mark: {
    get: () => DUM.createEl('mark')
  },
  
  q: {
    get: () => DUM.createEl('q')
  },
  
  rp: {
    get: () => DUM.createEl('rp')
  },
  
  rt: {
    get: () => DUM.createEl('rt')
  },
  
  rtc: {
    get: () => DUM.createEl('rtc')
  },
  
  ruby: {
    get: () => DUM.createEl('ruby')
  },
  
  s: {
    get: () => DUM.createEl('s')
  },
  
  samp: {
    get: () => DUM.createEl('samp')
  },
  
  span: {
    get: () => DUM.createEl('span')
  },
  
  strong: {
    get: () => DUM.createEl('strong')
  },
  
  sub: {
    get: () => DUM.createEl('sub')
  },
  
  sup: {
    get: () => DUM.createEl('sup')
  },
  
  time: {
    get: () => DUM.createEl('time')
  },
  
  u: {
    get: () => DUM.createEl('u')
  },
  
  wbr: {
    get: () => DUM.createEl('wbr')
  },
  
  area: {
    get: () => DUM.createEl('area')
  },
  
  audio: {
    get: () => DUM.createEl('audio')
  },
  
  map: {
    get: () => DUM.createEl('map')
  },
  
  track: {
    get: () => DUM.createEl('track')
  },
  
  video: {
    get: () => DUM.createEl('video')
  },
  
  embed: {
    get: () => DUM.createEl('embed')
  },
  
  object: {
    get: () => DUM.createEl('object')
  },
  
  param: {
    get: () => DUM.createEl('param')
  },
  
  source: {
    get: () => DUM.createEl('source')
  },
  
  canvas: {
    get: () => DUM.createEl('canvas')
  },
  
  caption: {
    get: () => DUM.createEl('caption')
  },
  
  col: {
    get: () => DUM.createEl('col')
  },
  
  colgroup: {
    get: () => DUM.createEl('colgroup')
  },
  
  table: {
    get: () => DUM.createEl('table')
  },
  
  tbody: {
    get: () => DUM.createEl('tbody')
  },
  
  td: {
    get: () => DUM.createEl('td')
  },
  
  tfoot: {
    get: () => DUM.createEl('tfooter')
  },
  
  th: {
    get: () => DUM.createEl('th')
  },
  
  thead: {
    get: () => DUM.createEl('thead')
  },
  
  tr: {
    get: () => DUM.createEl('tr')
  },
  
  button: {
    get: () => DUM.createEl('button')
  },
  
  datalist: {
    get: () => DUM.createEl('datalist')
  },
  
  fieldset: {
    get: () => DUM.createEl('fieldset')
  },

  form: {
    get: () => DUM.createEl('form')
  },

  input: {
    get: () => {
      let input = DUM.createEl('input');
      
      input.placeHolder = (val) => {
        input.setAttribute('placeholder', val);
        return input;
      }
      
      input.setType = (val) => {
        input.setAttribute('type', val);
        return input;
      }
      
      input.val = (val) => {
        if(typeof val === 'undefined') return input.value;
        input.value = val;
        return input;
      }
      
      return input;
    }
  },

  keygen: {
    get: () => DUM.createEl('keygen')
  },

  label: {
    get: () => DUM.createEl('label')
  },

  legend: {
    get: () => DUM.createEl('legend')
  },
  
  meter: {
    get: () => DUM.createEl('meter')
  },

  optgroup: {
    get: () => DUM.createEl('optgroup')
  },

  option: {
    get: () => DUM.createEl('option')
  },

  fragment: {
    get: () => DUM.decorateEl(document.createDocumentFragment())
  },
  
  progress: {
    get: () => DUM.createEl('progress')
  },

  select: {
    get: () => DUM.createEl('select')
  },
  
  details: {
    get: () => DUM.createEl('details')
  },

  dialog: {
    get: () => DUM.createEl('dialog')
  },

  menu: {
    get: () => DUM.createEl('menu')
  },

  article: {
    get: () => DUM.createEl('article')
  },

  section: {
    get: () => DUM.createEl('section')
  },
  
  menuitem: {
    get: () => DUM.createEl('menuitem')
  },

  summary: {
    get: () => DUM.createEl('summary')
  },
  
  //componenets
  content: {
    get: () => DUM.createEl('content')
  },

  element: {
    get: () => DUM.createEl('element')
  },

  shadow: {
    get: () => DUM.createEl('shadow')
  },

  template: {
    get: () => DUM.createEl('template')
  },

  // Shorthand methods for creating an element and appending content as the arguments
  $a: {
    value: (...appendList) => {
      let a = DUM.createEl('a');
      
      a.setHref = (link) => {
        a.setAttribute('href', link);
        return a;
      }
      
      return a.append(...appendList);
    }
  },
  
  $p: {
    value: (...appendList) => DUM.createEl('p').append(...appendList)
  },
  
  $h1: {
    value: (...appendList) => DUM.createEl('h1').append(...appendList)
  },
  
  $h2: {
    value: (...appendList) => DUM.createEl('h2').append(...appendList)
  },
  
  $h3: {
    value: (...appendList) => DUM.createEl('h3').append(...appendList)
  },
  
  $h4: {
    value: (...appendList) => DUM.createEl('h4').append(...appendList)
  },
  
  $h5: {
    value: (...appendList) => DUM.createEl('h5').append(...appendList)
  },
  
  $h6: {
    value: (...appendList) => DUM.createEl('h6').append(...appendList)
  },
  
  $ul: {
    value: (...appendList) => DUM.createEl('ul').append(...appendList)
  },
  
  $ol: {
    value: (...appendList) => DUM.createEl('ol').append(...appendList)
  },
  
  $li: {
    value: (...appendList) => DUM.createEl('li').append(...appendList)
  },
  
  $div: {
    value: (...appendList) => DUM.createEl('div').append(...appendList)
  },
  
  $img: {
    value: (...appendList) => DUM.createEl('IMG').append(...appendList)
  },
  
  $small: {
    value: (...appendList) => DUM.createEl('small').append(...appendList)
  },
  
  $footer: {
    value: (...appendList) => DUM.createEl('footer').append(...appendList)
  },
  
  $header: {
    value: (...appendList) => DUM.createEl('header').append(...appendList)
  },

  $article: {
    value: (...appendList) => DUM.createEl('article').append(...appendList)
  },

  $section: {
    value: (...appendList) => DUM.createEl('section').append(...appendList)
  },
  
  $hgroup: {
    value: (...appendList) => DUM.createEl('hgroup').append(...appendList)
  },
  
  $nav: {
    value: (...appendList) => DUM.createEl('nav').append(...appendList)
  },
  
  $dd: {
    value: (...appendList) => DUM.createEl('dd').append(...appendList)
  },
  
  $dl: {
    value: (...appendList) => DUM.createEl('dl').append(...appendList)
  },
  
  $dt: {
    value: (...appendList) => DUM.createEl('dt').append(...appendList)
  },
  
  $figcaption: {
    value: (...appendList) => DUM.createEl('figcaption').append(...appendList)
  },
  
  $figure: {
    value: (...appendList) => DUM.createEl('figure').append(...appendList)
  },
  
  $hr: {
    value: (...appendList) => DUM.createEl('hr').append(...appendList)
  },

  $fragment: {
    vale: (...appendList) => DUM.decorateEl(document.createDocumentFragment()).append(...appendList)
  },
  
  $main: {
    value: (...appendList) => DUM.createEl('main').append(...appendList)
  },
  
  $pre: {
    value: (...appendList) => DUM.createEl('pre').append(...appendList)
  },
  
  $abbr: {
    value: (...appendList) => DUM.createEl('abbr').append(...appendList)
  },
  
  $b: {
    value: (...appendList) => DUM.createEl('b').append(...appendList)
  },
  
  $bdi: {
    value: (...appendList) => DUM.createEl('bdi').append(...appendList)
  },
  
  $bdo: {
    value: (...appendList) => DUM.createEl('bdo').append(...appendList)
  },
  
  $br: {
    value: (...appendList) => DUM.createEl('br').append(...appendList)
  },
  
  $cite: {
    value: (...appendList) => DUM.createEl('cite').append(...appendList)
  },
  
  $code: {
    value: (...appendList) => DUM.createEl('code').append(...appendList)
  },
  
  $data: {
    value: (...appendList) => DUM.createEl('data').append(...appendList)
  },
  
  $dfn: {
    value: (...appendList) => DUM.createEl('dfn').append(...appendList)
  },
  
  $em: {
    value: (...appendList) => DUM.createEl('em').append(...appendList)
  },
  
  $i: {
    value: (...appendList) => DUM.createEl('i').append(...appendList)
  },
  
  $kdb: {
    value: (...appendList) => DUM.createEl('kdb').append(...appendList)
  },
  
  $mark: {
    value: (...appendList) => DUM.createEl('mark').append(...appendList)
  },
  
  $q: {
    value: (...appendList) => DUM.createEl('q').append(...appendList)
  },
  
  $rp: {
    value: (...appendList) => DUM.createEl('rp').append(...appendList)
  },
  
  $rt: {
    value: (...appendList) => DUM.createEl('rt').append(...appendList)
  },
  
  $rtc: {
    value: (...appendList) => DUM.createEl('rtc').append(...appendList)
  },
  
  $ruby: {
    value: (...appendList) => DUM.createEl('ruby').append(...appendList)
  },
  
  $s: {
    value: (...appendList) => DUM.createEl('s').append(...appendList)
  },
  
  $samp: {
    value: (...appendList) => DUM.createEl('samp').append(...appendList)
  },
  
  $span: {
    value: (...appendList) => DUM.createEl('span').append(...appendList)
  },
  
  $strong: {
    value: (...appendList) => DUM.createEl('strong').append(...appendList)
  },
  
  $sub: {
    value: (...appendList) => DUM.createEl('sub').append(...appendList)
  },
  
  $sup: {
    value: (...appendList) => DUM.createEl('sup').append(...appendList)
  },
  
  $time: {
    value: (...appendList) => DUM.createEl('time').append(...appendList)
  },
  
  $u: {
    value: (...appendList) => DUM.createEl('u').append(...appendList)
  },
  
  $wbr: {
    value: (...appendList) => DUM.createEl('wbr').append(...appendList)
  },
  
  $area: {
    value: (...appendList) => DUM.createEl('area').append(...appendList)
  },
  
  $audio: {
    value: (...appendList) => DUM.createEl('audio').append(...appendList)
  },
  
  $map: {
    value: (...appendList) => DUM.createEl('map').append(...appendList)
  },
  
  $track: {
    value: (...appendList) => DUM.createEl('track').append(...appendList)
  },
  
  $video: {
    value: (...appendList) => DUM.createEl('video').append(...appendList)
  },
  
  $embed: {
    value: (...appendList) => DUM.createEl('embed').append(...appendList)
  },
  
  $object: {
    value: (...appendList) => DUM.createEl('object').append(...appendList)
  },
  
  $param: {
    value: (...appendList) => DUM.createEl('param').append(...appendList)
  },
  
  $source: {
    value: (...appendList) => DUM.createEl('source').append(...appendList)
  },
  
  $canvas: {
    value: (...appendList) => DUM.createEl('canvas').append(...appendList)
  },
  
  $caption: {
    value: (...appendList) => DUM.createEl('caption').append(...appendList)
  },
  
  $col: {
    value: (...appendList) => DUM.createEl('col').append(...appendList)
  },
  
  $colgroup: {
    value: (...appendList) => DUM.createEl('colgroup').append(...appendList)
  },
  
  $table: {
    value: (...appendList) => DUM.createEl('table').append(...appendList)
  },
  
  $tbody: {
    value: (...appendList) => DUM.createEl('tbody').append(...appendList)
  },
  
  $td: {
    value: (...appendList) => DUM.createEl('td').append(...appendList)
  },
  
  $tfoot: {
    value: (...appendList) => DUM.createEl('tfooter').append(...appendList)
  },
  
  $th: {
    value: (...appendList) => DUM.createEl('th').append(...appendList)
  },
  
  $thead: {
    value: (...appendList) => DUM.createEl('thead').append(...appendList)
  },
  
  $tr: {
    value: (...appendList) => DUM.createEl('tr').append(...appendList)
  },
  
  $button: {
    value: (...appendList) => DUM.createEl('button').append(...appendList)
  },
  
  $datalist: {
    value: (...appendList) => DUM.createEl('datalist').append(...appendList)
  },
  
  $fieldset: {
    value: (...appendList) => DUM.createEl('fieldset').append(...appendList)
  },

  $form: {
    value: (...appendList) => DUM.createEl('form').append(...appendList)
  },

  $input: {
    value: (...appendList) => {
      let input = DUM.createEl('input').append(...appendList);
      
      input.placeHolder = (val) => {
        input.setAttribute('placeholder', val);
        return input;
      }
      
      input.setType = (val) => {
        input.setAttribute('type', val);
        return input;
      }
      
      input.val = (val) => {
        if(typeof val === 'undefined') return input.value;
        input.value = val;
        return input;
      }
      
      return input;
    }
  },

  $keygen: {
    value: (...appendList) => DUM.createEl('keygen').append(...appendList)
  },

  $label: {
    value: (...appendList) => DUM.createEl('label').append(...appendList)
  },

  $legend: {
    value: (...appendList) => DUM.createEl('legend').append(...appendList)
  },
  
  $meter: {
    value: (...appendList) => DUM.createEl('meter').append(...appendList)
  },

  $optgroup: {
    value: (...appendList) => DUM.createEl('optgroup').append(...appendList)
  },

  $option: {
    value: (...appendList) => DUM.createEl('option').append(...appendList)
  },
  
  $progress: {
    value: (...appendList) => DUM.createEl('progress').append(...appendList)
  },

  $select: {
    value: (...appendList) => DUM.createEl('select').append(...appendList)
  },
  
  $details: {
    value: (...appendList) => DUM.createEl('details').append(...appendList)
  },

  $dialog: {
    value: (...appendList) => DUM.createEl('dialog').append(...appendList)
  },

  $menu: {
    value: (...appendList) => DUM.createEl('menu').append(...appendList)
  },
  
  $menuitem: {
    value: (...appendList) => DUM.createEl('menuitem').append(...appendList)
  },

  $summary: {
    value: (...appendList) => DUM.createEl('summary').append(...appendList)
  }
});


