import { faCode, faCamera } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import fontawesome from '@fortawesome/fontawesome';

fontawesome.config = {
  autoAddCss: false,
};

fontawesome.library.add(fab, faCode, faCamera);
