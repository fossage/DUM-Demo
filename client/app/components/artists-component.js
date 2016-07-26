import {DUM}         from '../../dum-core/dum';
import {Gen}         from '../services/gen-service';
import {Artist}      from '../services/artists';
import {SlideOpen}   from '../component-templates/slide-open';
import {Select}      from '../component-templates/select';
import {Artists}     from '../component-templates/artists';
import {audioPlayer} from '../components/audio-player';


export const artists = DUM.Component(() => {
  return Artist.get()
  .then((items) => {
    let comp = Artists({
      containerClasses: 'artists',
      template: _itemTemplate,
      items: items
    }).setClass('flex-parent', 'wrap', 'jc-center');;

    function _itemTemplate(item) {
      // ELEMENT SETUP
      let element        = DUM.div;
      let bioContainer   = DUM.$div(DUM.p.text(item.bio));
      
      let imageContainer = DUM.$div(
        DUM.img.setSrc(item.imageUrl),
        bioContainer
      ).setClass('image-container');

      let figCaption = DUM.$figcaption(DUM.a.setHref(item.linkTo).attr('target', '_blank').text(item.name));

      // Would usually be with the private functions, but up top
      // because it needs to be wrapped in an iife
      let _scrollBio = (function (){
        let id;
        let offset = 0;
        
        return (buffer, playing) => {
          if(playing) {
            id = window.requestAnimationFrame(() => {
              offset += 1;
              if(offset >= buffer) {
                offset = 0;
                bioContainer.childNodes[0].scrollTop += 1;
              }
              
              _scrollBio(buffer, playing);
            });
          } else {
            window.cancelAnimationFrame(id);
          }
        }
      }());

      // Set up audio player and return svg so we can attach it
      audioPlayer({
        svgPath: 'images/ephemera/play-button.svg',
        onPlay: _toggleOnPlay,
        onStop: _toggleOnPlay,
        trackUrl: item.trackUrl
      })
      .then((svg) => {
        bioContainer.append(DUM.$div(svg));

        element.append(
          DUM.$figure(
            imageContainer,
            figCaption
          )
        )
        .setClass('flex-1', 'artist-tile')
      });
      
      /*============== PRIVATE FUNCTION ==============*/
      function _toggleOnPlay(playing) {
        _scrollBio(5, playing);
        imageContainer.toggleClass('playing');
        figCaption.toggleClass('playing');
      }

      element.on('didMount', () => {
        element
        .wait(500)
        .then(() => {
          element.setClass('mounted')
        })
      });

      return element;
    }

    comp.on('didMount', () => {
      comp
      .wait(500)
      .then(() => {
        comp.setClass('mounted')
      });
    });

    return comp;
  });
});