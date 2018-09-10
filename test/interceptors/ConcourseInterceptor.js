const hock = require('hock');
const formurlencoded = require('form-urlencoded').default;

class ConcourseInterceptor {
  constructor(url, teamName, authentication) {
    this.teamName = teamName;
    this.authentication = authentication;
    this.mock = hock.createHock();
  }

  getHandler() {
    return this.mock.handler;
  }

  onGetInfo() {
    return this.mock.get('/api/v1/info');
  }

  onCreateToken() {
    return this.mock
      .post(
        '/sky/token',
        formurlencoded({
          grant_type: 'password',
          username: this.authentication.username,
          password: this.authentication.password,
          scope: 'openid+profile+email+federated:id+groups',
        }),
      );
  }

  onFetchAllTeams(token) {
    return this.mock
      .get('/api/v1/teams', {
        Authorization: `Bearer ${token.access_token}`,
      })
      .many();
  }

  onFetchAllPipelines(token) {
    return this.mock
      .get(`/api/v1/teams/${this.teamName}/pipelines`, {
        Authorization: `Bearer ${token.access_token}`,
      });
  }

  onFetchPipeline(pipelineName, token) {
    return this.mock
      .get(`/api/v1/teams/${this.teamName}/pipelines/${pipelineName}`, {
        Authorization: `Bearer ${token.access_token}`,
      });
  }

  onFetchAllJobs(pipelineName, token) {
    return this.mock
      .get(`/api/v1/teams/${this.teamName}/pipelines/${pipelineName}/jobs`, {
        Authorization: `Bearer ${token.access_token}`,
      });
  }

  onFetchBuild(buildId, token) {
    return this.mock
      .get(`/api/v1/builds/${buildId}`, {
        Authorization: `Bearer ${token.access_token}`,
      });
  }

  onFetchBuildResources(buildId, token) {
    return this.mock
      .get(`/api/v1/builds/${buildId}/resources`, {
        Authorization: `Bearer ${token.access_token}`,
      });
  }
}

module.exports = ConcourseInterceptor;
