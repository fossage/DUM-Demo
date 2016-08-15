'use strict';
import {createEvent} from './utils/element';
import {DUM} from './dum';

DUM.Router = DUM.Service('Router', {});

let _routes            = {};
let _rootView          = null;
let _prevState         = null;
let _initialized       = false;
let _currentState      = null;
let _disableStateClass = false;
let _viewClassPrefix   = '-view';

/*===============================================
            LISTENER INITIALIZATION
============================================== */
window.addEventListener('popstate', (e) => {
  let state = e.state || DUM.Router.$$config.root;
  _prevState = _currentState;
  _fireStateEvent('stateChangeStart', _routes[state.name]);

  // ensure we don't remove our root view
  if(_prevState.name !== 'root') _routes[_prevState.name].$$instanceView.remove();
  
  // if not root route, append the view associated with the route to root view
  if(state.name !== 'root') {
    let iView = _routes[state.name].view();
    
    Promise.resolve(iView)
    .then((view) => {
      if(!_disableStateClass) _rootView.removeClass(`${_viewClassPrefix}-${_currentState.name}`)
      _currentState = _routes[state.name]
      _currentState.$$instanceView = view;
      _rootView.append(view);
      if(!_disableStateClass) _rootView.addClass(`${_viewClassPrefix}-${_currentState.name}`);
      _fireStateEvent('stateChangeEnd', _routes[state.name]);
    });
  } else {
    let root = DUM.Router.$$config.root;

     if(root.redirectTo) {
       DUM.Router.goTo({
         name: root.redirectTo, 
         isRedirect: true
       });

       _currentState = _routes[root.redirectTo];
     } else {
       _currentState = DUM.Router.$$config.root;
     }
  }
});

/*===============================================
             METHOD/PROP DEFINITIONS
============================================== */
Object.defineProperties(DUM.Router, {
  $$config: {
    value: {
      root: {
        name: 'root',
        path: '/',
        view: null
      }
    }
  },

  info: {
    get: () => { return {routes: _routes, previousState: _prevState, currentState: _currentState} }
   
  },

  current: {
    get: () => { return _currentState }
  },

  config: {
    value: (opts) => {
      if(!opts.root && opts.root.view) throw new Error('Router requires a root configuration object with a root view');
      Object.assign(DUM.Router.$$config, opts);
      _rootView          = opts.root.view();
      _currentState      = _routes.root = DUM.Router.$$config.root;
      _viewClassPrefix   = opts.viewClassPrefix   || '-view';
      _disableStateClass = opts.disableStateClass || false;
      DUM.attach(_rootView);

      return DUM.Router;
    },
  },
  
  addRoutes: {
    value: (routeInfo) => {
      routeInfo.forEach((route) => {
        if(!route.name || !route.path) throw new Error('Route objects require a name and a path key to be set.');
        _routes[route.name] = route;
      });
      
      // if we are on inital app load, automatically go to the pathname in url
      if(!_initialized) {
        let path = window.location.pathname;
        
        if(path !== '/') { 
          DUM.Router.goTo({
            name: path.slice(1)
          });
        } else {
          let root = DUM.Router.$$config.root;
          DUM.Router.goTo({
            name: root.redirectTo || root.path
          });
        }
      } 
      _initialized = true;

      return DUM.Router;
    }
  },
  
  goTo: {
    value: (options) => {
      let state = _routes[options.name];

      // We set the 'isRedirect' flag when we navigate to the root view with the 'redirectTo' 
      // config option set to prevent us from navigating to an empty state where the user
      // is on the default view and trys to navigate back to root
      if(!options.isRedirect && state.path === _currentState.path) return DUM.Router;
      _currentState.to = _routes[options.routeName];
      _fireStateEvent('stateChangeStart', _currentState);
      state.$$instanceView = state.view(options.data);

      Promise.resolve(state.$$instanceView)
      .then((iView) => {
        if(!_disableStateClass) _rootView.removeClass(`${_viewClassPrefix}-${_currentState.name}`)
        state.$$instanceView = iView;

        let parent = state.$$instanceView.parentNode || _rootView;

        if(_currentState.$$instanceView && _currentState.$$instanceView.remove) _currentState.$$instanceView.remove();
        if(state.$$instanceView) parent.append(state.$$instanceView);
        _currentState.to = null;

        history.pushState({name: state.name, path: state.path}, state.name || '', state.path);
        _currentState = state;
        if(!_disableStateClass) _rootView.addClass(`${_viewClassPrefix}-${_currentState.name}`)

       _fireStateEvent('stateChangeEnd', state);
      });

      return DUM.Router;
    }
  }
});

function _fireStateEvent(eventType, data) {
  let event = createEvent(eventType, data)
  window.dispatchEvent(event);
}