const { writeFile } = require('fs');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const writeFilePromisified = promisify(writeFile);

const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  production: false,
  auth0: {
    domain: '${process.env['AUTH0_DOMAIN']}',
    clientId: '${process.env['AUTH0_CLIENT_ID']}',
    authorizationParams: {
      redirect_uri: '${process.env['AUTH0_CALLBACK_URL']}',
    },
  },
  api: {
    serverUrl: '${process.env['API_SERVER_URL']}',
    xMasterKey: '${process.env['X_MASTER_KEY']}',
    userEndpoint: '${process.env['USER_DATA_ENDPOINT']}',
    songLogEndpoint: '${process.env['SONG_LOG_ENDPOINT']}'
  },
};
`;

(async () => {
  try {
    await writeFilePromisified(targetPath, envConfigFile);
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
