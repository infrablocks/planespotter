const nock = require('nock');

class ConcourseInterceptor {
  constructor(baseUri) {
    this.baseUri = baseUri;
  }

  getAuthToken(username, password) {
    return nock(this.baseUri.href)
      .get('/teams/main/auth/token')
      .basicAuth({
        user: username,
        pass: password,
      });
  }

  getPipelines(token) {
    return nock(this.baseUri.href)
      .get('/teams/main/pipelines')
      .matchHeader('authorization', token);
  }

  getJobs(pipeline, token) {
    return nock(this.baseUri.href)
      .matchHeader('authorization', token)
      .get(`/teams/main/pipelines/${pipeline}/jobs`);
  }
}

module.exports = ConcourseInterceptor;
