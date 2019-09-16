const { Client } = require('@infrablocks/concourse');

class Concourse {
  constructor(url, teamName, authentication) {
    this.teamName = teamName;
    this.client = Client.instanceFor({
      url: url.origin,
      username: authentication.username,
      password: authentication.password,
      teamName,
      timeout: 10000
    });
  }

  async fetchAllPipelines() {
    return (await this.client.forTeam(this.teamName)).listPipelines();
  }

  async fetchAllJobs(allPipelines) {
    const teamClient = await this.client.forTeam(this.teamName);
    const jobsForPipelines = await Promise.all(allPipelines
      .map(async (pipeline) => {
        const pipelineClient = await teamClient.forPipeline(pipeline.name);
        const pipelineJobs = await pipelineClient.listJobs();

        return pipelineJobs;
      }));
    return jobsForPipelines.reduce((xs, x) => xs.concat(x), []);
  }

  async fetchBuildResources(buildId) {
    return (await this.client.forBuild(buildId)).listResources();
  }
}

module.exports = Concourse;

