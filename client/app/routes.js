'use strict';
import {DUM}      from '../dum-core/dum';
import {artists}  from './components/artists-component';
import {news}     from './components/news-component';
import {reddit}   from './components/reddit-component';

/*======== ROUTES =======*/
DUM.Router
.addRoutes([
  {
    name: 'news',
    path: '/news',
    view: news
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