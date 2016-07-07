import {DUM}         from '../../dum-core/dum';
import {Gen}         from '../services/gen-service';
import {Artist}      from '../services/artists';
import {SlideOpen}   from '../component-templates/slide-open';
import {Select}      from '../component-templates/select';
import {Artists}     from '../component-templates/artists';
import {audioPlayer} from '../components/audio-player';

/**Naturebot

Madeleine Cocolas

Tim Held

Leave Trace

Effisay

Diogenes

Tim and Tess */

// let items = [
//   {
//     name: 'Animals At Night',
//     imageUrl: 'AAN-2016.jpg',
//     trackUrl: 'bigdata-dangerous.m4a',
//     linkTo: 'http://www.graigmarkelmusic.com/Graig_Markel_Music/AAN_Home.html',
//     bio: 'The year is 1976, and Graig Markel has spent many nights after-hours in the Recovery Room, experimenting and creating with his modular synthesizer. Many components of which, were hand-made by markel himself. Each night resulting in a composition of mono synth and found loops, recorded live to 1 one mono track. The Animals at Night’s upcoming release is a study on the texture of sound. Composition is taken out of the equation, allowing the opportunity to focus entirely on the structure of sounds. The end result is as rich an ambient experience as they come.The Animals at Night is not music for a sunny afternoon. Graig Markel removes rhythms and melodies that contemporary music is based on, and creates a soundscape of unique synthesizer noise that can be compared to few other recordings.'
//   },
  
//   {
//     name: 'Head Like A Kite',
//     trackUrl: 'lcd-dyc.m4a',
//     imageUrl: 'HLAK1.jpg',
//     linkTo: 'http://www.headlikeakite.com/HLAK___Home.html',
//     bio: 'Breaking down beats seems as natural to HEAD LIKE A KITE\'s Dave Einmo as breaking down genre barriers. Einmo’s recording approach begins with challenging pop songwriting, followed by his own basic tracking with live instruments. Foundation in place, Einmo transforms into manic-producer-DJ, chopping, slicing and sampling his own instrumental tracks then peppering the recordings with guests. Einmo’s release with SCR show’s a departure from the business as usual HLAK. Here we are lead to an aural landscape where a darker and delightfully disjointed side to Einmo’s production paints the horizon ablaze with sonic texture.'
//   },

//   {
//     name: 'Madeleine Cocolas',
//     trackUrl: 'okgo-higa.mp3',
//     linkTo: 'http://www.madeleinecocolas.com/',
//     imageUrl: 'maddy.jpg',
//     bio: 'Madeleine Cocolas is a classically-trained composer, musician, and sound designer.   She released her debut album Cascadia in 2016 based on her critically-acclaimed 52 Weeks project.  In 2015 she composed and performed a live score to Alfred Hitchcock\'s classic film The Birds as part of theNorthwest Film Forum Puget Soundtrack series.  Madeleine has collaborated on multidisciplinary projects with numerous choreographers, musicians, and visual artists. Madeleine has also worked as a music supervisor, sourcing and licensing music for a number of award-winning Australian television programs, including the International Emmy-nominated shows Please Like Me and Dance Academy.'
//   },
  
//   {
//     imageUrl: 'IAN.jpg',
//     trackUrl: 'bigdata-dangerous.m4a',
//     name: 'Naturebot',
//     linkTo: 'https://soundcloud.com/naturebot',
//     bio: 'Pleasureboat Records head honcho, Ian Price, AKA Naturebot, takes a break from label boss to lend SCR a characteristically mind bending collection of tunes.'
//   }, 
  
//   {
//     name: 'Tim Held',
//     trackUrl: 'girltalk-ohno.mp3',
//     imageUrl: 'tim2.jpg',
//     linkTo: 'https://soundcloud.com/timheld',
//     bio: 'Tim Held is an electronic musician and film composer residing in the Pacific Northwest. Seattle’s The Stranger has said that his sound is defined by inventively jittery rhythms and kaleidoscopically bizarre textures. Hailed as “one of the few Seattle producers making IDM sound vital and inventive”, Dave Segal chronicled Held\’s 2015 release, TypicalHaunts, as “one of the best electronic records to come out of [Seattle] in the last five years.”'
//   },
  
//   {
//     name: 'Leave Trace',
//     trackUrl: 'girltalk-ohno.mp3',
//     imageUrl: 'chris.png',
//     linkTo: 'http://splendidbeats.com',
//     bio: 'Leave Trace is Chris Haines, a PNW native and long-time Seattle resident. Aside from solo pursuits, Leave Trace\’s cinematic mix of texture, melody, improvisation, psychedelia, and dub-inspired production techniques can often be heard in a number of musical outlets. His projects include performing as a co-founding member of Monster Planet (an experimental, improv, a/v, gear orgy); Sonic Shiva (a spaced-out, psychedelic jamrock band); and Liight (guitar \’n\’ bleeps deeptronica). He also co-founded Chillography — Seattle\’s longest running event series devoted the mellower side of electronic music, and disk-jockeyed psydubproggoatechtrancebeint for nearly 20 years as Crispy. Adjective, adjective? Adjective.'
//   },

//   {
//     name: 'Diogenes',
//     trackUrl: 'girltalk-ohno.mp3',
//     imageUrl: 'Diogenes.jpg',
//     linkTo: 'https://soundcloud.com/diogenes23',
//     bio: ''
//   }
  
// ];

export const artists = DUM.Component(() => {
  return Artist.get()
  .then((items) => {
    let comp = Artists({
      containerClasses: 'artists',
      template: _itemTemplate,
      items: items
    }).setClass('flex-parent', 'wrap', 'justify-content', 'center');;

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
        .wait(1000)
        .then(() => {
          element.setClass('mounted');
        });
      });

  
      return element;
    }

    comp
    .wait(800)
    .then(() => {
      comp.setClass('mounted');
    });

    return comp;
  });
});