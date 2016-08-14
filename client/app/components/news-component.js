import {DUM}       from '../../dum-core/dum';
import {News}      from '../services/news-service';
import {SlideOpen} from '../component-templates/slide-open';

export const news = DUM.Component((options = {}) => {
  return DUM.loadSVG('fonts/Entypo+/tag-no-string.svg')
  .then((svg) => {
    return News.get()
    .then((newsItems) => {
      let container = DUM.div.setClass('news-container');

      newsItems.forEach(itemTemplate);

      function itemTemplate(item) {
        let content;
        let date = new Date(item.createdAt).toDateString();
        
        if(item.htmlContent) {
          content = DUM.p;
          
          if (item.body[0] !== '<') {
            item.body = '<span>' + item.body + '</span>';
            content.innerHTML = item.body;
          } else {
            content.innerHTML = item.body;
          }
          
        } else {
          content = DUM.p.text(item.body);
        }

        if(item.imageUrl) content.prepend(DUM.img.setSrc(item.imageUrl));
        
        if(item.tags) {
          let tagContainer = DUM.div.setClass('tag-container', 'flex-parent', 'flex-start');

          item.tags.forEach((tag) => {
            let tagEl = DUM
            .span
            .append(DUM.span.text(tag))
            .setClass('tag', 'link')
            .prepend(svg.cloneNode(true))
            .click(() => {
              News.getTagged(tag)
              .then((resp) => {
                container.empty();
                document.body.scrollTop = 0;
                resp.forEach(itemTemplate)
              })
            });

            tagContainer.append(tagEl);
          });

          content.append(tagContainer);
        }

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
      }

      return container;
    });
  })
});