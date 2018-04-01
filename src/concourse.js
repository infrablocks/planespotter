const request = require('request-promise-native');

class Concourse {
  constructor(baseUri, team) {
    this.baseUri = baseUri;
    this.team = team;
  }

  async fetchAccessToken(username, password) {
    const fetchTokenUrl = `${this.baseUri.href}/teams/${this.team}/auth/token`;

    try {
      const basicAuthTokenResponse = await request.get({
        url: fetchTokenUrl,
        json: true,
        auth: {
          user: username,
          password,
        },
      });
      return `${basicAuthTokenResponse.type} ${basicAuthTokenResponse.value}`;
    } catch (e) {
      throw new Error(`Unable to fetch authorization token. Reason: ${e.message}`);
    }
  }

  async fetchAllPipelines(basicAuthToken) {
    const fetchPipelinesUrl = `${this.baseUri.href}/teams/${this.team}/pipelines`;
    try {
      return await request.get({
        url: fetchPipelinesUrl,
        json: true,
        headers: {
          Authorization: basicAuthToken,
        },
      });
    } catch (e) {
      throw new Error(`Unable to fetch pipeline information for url ${e.options.url}.
      Reason: ${e.message}`);
    }
  }

  async fetchAllJobs(allPipelines, basicAuthToken) {
    try {
      return (await Promise.all(allPipelines.map(pipeline =>
        request.get({
          url: `${this.baseUri.href}${pipeline.url}/jobs`,
          json: true,
          headers: {
            Authorization: basicAuthToken,
          },
        })))).reduce((xs, x) => xs.concat(x), []);
    } catch (e) {
      throw new Error(`Unable to fetch jobs information for url ${e.options.url}.
      Reason: ${e.message}`);
    }
  }
}

module.exports = Concourse;
