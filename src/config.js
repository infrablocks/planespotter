const env = require('env-var');
const url = require('url');

const fetchConfig = () => {
  const URL = env('URL').required().asString();
  const TEAM = env('TEAM').asString();
  const AUTH_USERNAME = env('AUTH_USERNAME').required().asString();
  const AUTH_PASSWORD = env('AUTH_PASSWORD').required().asString();
  return {
    url: new url.URL(URL),
    teamName: TEAM || 'main',
    authentication: {
      username: AUTH_USERNAME,
      password: AUTH_PASSWORD,
    },
  };
};

const config = (environment) => {
  switch (environment) {
    case 'production':
      return fetchConfig();
    case 'test':
      return {
        url: new url.URL('http://localhost:1337'),
        teamName: 'main',
        authentication: {
          username: 'some-username',
          password: 'some-password',
        },
      };
    default:
      throw new Error('Must set NODE_ENV to production/test');
  }
};

module.exports = config(process.env.NODE_ENV);
