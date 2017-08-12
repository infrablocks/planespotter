const env = require('env-var');
const { URL } = require('url');

const fetchConfig = () => {
  const API_URL = env('API_URL').required().asString();
  const TEAM = env('TEAM').asString();
  const AUTH_USERNAME = env('AUTH_USERNAME').required().asString();
  const AUTH_PASSWORD = env('AUTH_PASSWORD').required().asString();
  return {
    baseApiUri: new URL(API_URL),
    team: TEAM || 'main',
    authUsername: AUTH_USERNAME,
    authPassword: AUTH_PASSWORD,
  }
};

const config = (env) => {
  switch (env) {
    case 'production':
      return fetchConfig();
    case 'test':
      return {
        baseApiUri: new URL('https://ci/api/v1'),
        team: 'main',
        authUsername: 'some-username',
        authPassword: 'some-password',
      };
    default:
      throw new Error('Must set NODE_ENV to production/test');
  }
};

module.exports = config(process.env.NODE_ENV);