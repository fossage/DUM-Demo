import {HTTP} from './http-service';
import {DUM} from '../../dum-core/dum';

export const Artist = DUM.Service('Artist', {});

Object.defineProperties(Artist, {
  get: {
    value: () => HTTP.get('artist')
  }
});