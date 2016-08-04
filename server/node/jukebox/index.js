import JukeboxServices from './src/services';
import config from './src/config';

const service = new JukeboxServices(config);
service.start();


