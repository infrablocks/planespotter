const chai = require('chai');
const builders = require('./builders');
const feed = require('../src/feed');
const config = require('../src/config');

const expect = chai.expect;

describe('toProjects', () => {

  it('should map successful job to project', () => {
    const job = builders.buildJobFor('pipeline1', 'job1');
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
        name: 'pipeline1#job1',
        activity: 'Sleeping',
        lastBuildStatus: 'Success',
        lastBuildLabel: 'pipeline1',
        lastBuildTime: 1502470729,
        webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`
      }
    )
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
    const job = builders.buildJobFor('pipeline1', 'job1');
    job.next_build = { id: 123 };
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
        name: 'pipeline1#job1',
        activity: 'Building',
        lastBuildStatus: 'Success',
        lastBuildLabel: 'pipeline1',
        lastBuildTime: 1502470729,
        webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`
      }
    )
  });

  it('returns failed job', () => {
    const job = builders.buildJobFor('pipeline1', 'job1');
    job.finished_build.status = 'failed';
    const project = feed.toProject(config.baseApiUri, job);

    expect(project).to.eql({
        name: 'pipeline1#job1',
        activity: 'Sleeping',
        lastBuildStatus: 'Failure',
        lastBuildLabel: 'pipeline1',
        lastBuildTime: 1502470729,
        webUrl: `${config.baseApiUri.origin}/teams/main/pipelines/pipeline1/jobs/job1/builds/2`
      }
    )
  })

});