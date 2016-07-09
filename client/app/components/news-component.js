import {DUM}       from '../../dum-core/dum';
import {News}      from '../services/news-service';
import {SlideOpen} from '../component-templates/slide-open';

export const news = DUM.Component((options = {}) => {
  News.get()
  .then((news) => {
    console.log(news);
  });

  return DUM.$div(DUM.h1.text('testing'));
  
});