export const environment = {
  production: false,
  auth0: {
    domain: 'dev-vtyva65b53t6gsgu.us.auth0.com',
    clientId: 'ZE3UzCe3MglxW0X7TFaUIduUGSpGw5Mv',
    authorizationParams: {
      redirect_uri: 'http://localhost:4200/callback',
    },
  },
  api: {
    serverUrl: 'http://localhost:6060',
    xMasterKey: '$2b$10$hXJ27uxu/Vbs4bXCr4fKp.HlIq2MImzTKfpKUcFWVv2QiXvgBFome',
  },
};
