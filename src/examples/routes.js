'use strict';
import {DUM}      from '../dum-core/dum';
import {artists}  from './components/artists-component';
import {todoList} from './components/todo-list-component';
import {reddit}   from './components/reddit-component';

/*======== ROUTES =======*/
DUM.Router
.addRoutes([
  {
    name: 'about',
    path: '/about',
    view: todoList
  },
  
  {
    name: 'artists',
    path: '/artists',
    view: artists
  },
  
  // {
  //   name: 'shows',
  //   path: '/shows',
  //   view: null
  // }, 

  // {
  //   name: 'videos',
  //   path: '/videos',
  //   view: null
  // }
]);