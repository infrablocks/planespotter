const chance = require('chance').Chance();

const _pickRandom = list => list[Math.floor(Math.random() * list.length)];

exports.buildPipelinesFor =
  ({
    pipelinesNames = [chance.word()],
  } = {}) =>
    pipelinesNames.map(pipelineName => ({
      id: chance.natural(),
      name: pipelineName,
    }));

exports.buildJobFor =
  ({
    pipelineName = chance.word(),
    jobName = chance.word(),
    jobId = `${pipelineName}-${jobName}-id`,
  } = {}) => ({
    next_build: null,
    finished_build: {
      id: jobId,
      team_name: 'main',
      status: 'succeeded',
      job_name: jobName,
      api_url: `/teams/main/pipelines/${pipelineName}/jobs/${jobName}/builds/2`,
      pipeline_name: pipelineName,
      end_time: 1502470729,
    },
  });

exports.buildResourceFor =
  ({
    resourceName = chance.word(),
    resourceType = _pickRandom(['git', 'semver']),
    resourceVersion = chance.guid(),
  } = {}) => ({
    name: resourceName,
    resource: resourceName,
    type: resourceType,
    version: { thing: resourceVersion },
  });

exports.buildResourcesFor =
  ({ resources }) => ({
    inputs: resources,
  });

exports.buildJobsFor =
  ({
    pipelineName = chance.word(),
    jobNames = [chance.word()],
    jobs = jobNames.map(jobName =>
      this.buildJobFor({ pipelineName, jobName })),
  } = {}) => jobs;
