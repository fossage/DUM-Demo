import {DUM}       from '../../dum-core/dum';
import {News}      from '../services/news-service';
import {SlideOpen} from '../component-templates/slide-open';

export const news = DUM.Component((options = {}) => {
  return News.get()
  .then((newsItems) => {
    let container = DUM.div.setClass('news-container');

    newsItems.forEach((item) => {
      let content;
      let date = new Date(item.createdAt).toDateString();
      
      if(item.htmlContent) {
        content = DUM.p;
        if (item.body[0] !== '<') item.body = '<p>' + item.body + '</p>';
        content.innerHTML = item.body;
        content           = DUM.fragment.append(content.children);
      } else {
        content = DUM.p.text(item.body);
      }

      if(item.imageUrl) content.prepend(DUM.img.setSrc(item.imageUrl));


       let article = DUM.$article(
         DUM.$header(
           DUM.h1.text(item.title),
           DUM
           .p
           .text('Posted on: ')
           .append(DUM.span.text(date))
          ),

          DUM.$section(
            content
          ).setClass('news-content')
       ).setClass('news-item-container', 'clearfix');

       container.append(article);
    });
    console.log(newsItems);
    return container;
  });
});