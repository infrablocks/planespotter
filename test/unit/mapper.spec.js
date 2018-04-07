const { expect } = require('chai');
const builders = require('../builders');
const feed = require('../../src/feed');
const config = require('../../src/config');

describe('toProjects', () => {
  it('should map successful job to project', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
      Project: {
        _attr: {
          name: 'pipeline1#job1',
          activity: 'Sleeping',
          lastBuildStatus: 'Success',
          lastBuildLabel: 'pipeline1',
          lastBuildTime: '2017-08-11T16:58:49.000Z',
          webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
        },
      },
    });
  });

  it('returns empty project if job with no build history', () => {
    const newJob = {
      next_build: null,
      finished_build: null,
    };

    const project = feed.toProject(config.baseApiUri, newJob);

    expect(project).to.eql(null);
  });

  it('returns job as Building if next build info present', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.next_build = { id: 123 };
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
      Project: {
        _attr: {
          name: 'pipeline1#job1',
          activity: 'Building',
          lastBuildStatus: 'Success',
          lastBuildLabel: 'pipeline1',
          lastBuildTime: '2017-08-11T16:58:49.000Z',
          webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
        },
      },
    });
  });

  it('returns failed job if status failed', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.finished_build.status = 'failed';
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
      Project: {
        _attr: {
          name: 'pipeline1#job1',
          activity: 'Sleeping',
          lastBuildStatus: 'Failure',
          lastBuildLabel: 'pipeline1',
          lastBuildTime: '2017-08-11T16:58:49.000Z',
          webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
        },
      },
    });
  });

  it('returns failed job is errored', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.finished_build.status = 'errored';
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
      Project: {
        _attr: {
          name: 'pipeline1#job1',
          activity: 'Sleeping',
          lastBuildStatus: 'Failure',
          lastBuildLabel: 'pipeline1',
          lastBuildTime: '2017-08-11T16:58:49.000Z',
          webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
        },
      },
    });
  });
});

describe('toJobStats', () => {
  it('should map successful job to project', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    const project = feed.toJobStats(config.baseApiUri, job);

    expect(project).to.eql({
      id: 'pipeline1-job1-id',
      name: 'pipeline1#job1',
      activity: 'Sleeping',
      lastBuildStatus: 'Success',
      lastBuildLabel: 'pipeline1',
      lastBuildTime: '2017-08-11T16:58:49.000Z',
      webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
    });
  });

  it('returns empty project if job with no build history', () => {
    const newJob = {
      next_build: null,
      finished_build: null,
    };

    const project = feed.toJobStats(config.baseApiUri, newJob);

    expect(project).to.eql(null);
  });

  it('returns job as Building if next build info present', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.next_build = { id: 123 };
    const project = feed.toJobStats(config.baseApiUri, job);

    expect(project).to.eql({
      id: 'pipeline1-job1-id',
      name: 'pipeline1#job1',
      activity: 'Building',
      lastBuildStatus: 'Success',
      lastBuildLabel: 'pipeline1',
      lastBuildTime: '2017-08-11T16:58:49.000Z',
      webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
    });
  });

  it('returns failed job if status failed', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.finished_build.status = 'failed';
    const project = feed.toJobStats(config.baseApiUri, job);

    expect(project).to.eql({
      id: 'pipeline1-job1-id',
      name: 'pipeline1#job1',
      activity: 'Sleeping',
      lastBuildStatus: 'Failure',
      lastBuildLabel: 'pipeline1',
      lastBuildTime: '2017-08-11T16:58:49.000Z',
      webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
    });
  });

  it('returns failed job is errored', () => {
    const job = builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' });
    job.finished_build.status = 'errored';
    const project = feed.toJobStats(config.baseApiUri, job);

    expect(project).to.eql({
      id: 'pipeline1-job1-id',
      name: 'pipeline1#job1',
      activity: 'Sleeping',
      lastBuildStatus: 'Failure',
      lastBuildLabel: 'pipeline1',
      lastBuildTime: '2017-08-11T16:58:49.000Z',
      webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`,
    });
  });
});

describe('toJobResources', () => {
  it('should map input resources', () => {
    const resource1 = builders.buildResourceFor();
    const resource2 = builders.buildResourceFor();
    const jobResources = builders.buildResourcesFor({
      resources: [
        resource1,
        resource2,
      ],
    });
    const project = feed.toJobResources(jobResources);

    expect(project).to.eql([
      {
        name: resource1.name,
        type: resource1.type,
        version: resource1.version,
      },
      {
        name: resource2.name,
        type: resource2.type,
        version: resource2.version,
      },
    ]);
  });

  it('should map empty input resources', () => {
    const jobResources = builders.buildResourcesFor({
      resources: [],
    });

    const project = feed.toJobResources(jobResources);

    expect(project).to.eql([]);
  });
});
