const chance = require('chance').Chance();

exports.buildPipelinesFor = pipelines => pipelines.map(pipeline => ({
  id: chance.natural(),
  name: pipeline,
  url: `/teams/main/pipelines/${pipeline}`,
}));

exports.buildJobFor = (pipeline, job) => ({
  next_build: null,
  finished_build: {
    id: `${pipeline}-${job}-id`,
    team_name: 'main',
    status: 'succeeded',
    job_name: job,
    url: `/teams/main/pipelines/${pipeline}/jobs/${job}/builds/2`,
    pipeline_name: pipeline,
    end_time: 1502470729,
  },
});

exports.buildResourceFor = ({ resourceName, resourceType, resourceVersion }) => ({
  name: resourceName,
  resource: resourceName,
  type: resourceType,
  version: resourceVersion,
});


exports.buildResourcesFor = ({ resources }) => ({
  inputs: resources,
});

exports.buildJobsFor = ({ pipeline, jobs }) => jobs.map(job => this.buildJobFor(pipeline, job));
