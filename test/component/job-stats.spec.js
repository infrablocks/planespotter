const { expect, use } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../src/app');
const config = require('../../src/config');
const builders = require('./../builders');
const helpers = require('../helpers');
const ConcourseInterceptor = require('./../interceptors/ConcourseInterceptor');

use(chaiHttp);

describe('App', () => {
  describe('/job-stats.json', () => {
    let concourse;
    beforeEach(() => {
      concourse = new ConcourseInterceptor(config.baseApiUri);
      concourse.getAuthToken(config.authUsername, config.authPassword)
        .reply(200, {
          type: 'Bearer',
          value: 'some-token',
        });
    });

    it('responds with status 200', (done) => {
      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: ['pipeline1', 'pipeline2'],
        }));

      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipelineName: 'pipeline1',
          jobNames: ['job1', 'job2'],
        }));

      concourse.getJobs('pipeline2', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipelineName: 'pipeline2',
          jobNames: ['job1', 'job2'],
        }));

      chai.request(app)
        .get('/job-stats.json')
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readJsonFile('success-response');
          expect(JSON.parse(res.text)).to.deep.equal(JSON.parse(expectedResponse));
          done();
        });
    });

    it('responds with no projects if job has no finished builds', (done) => {
      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor({ pipelinesNames: ['pipeline1'] }));

      const emptyJob = {
        next_build: null,
        finished_build: null,
      };
      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, [
          builders.buildJobFor({ pipelineName: 'pipeline1', jobName: 'job1' }),
          emptyJob,
        ]);

      chai.request(app)
        .get('/job-stats.json')
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readJsonFile('empty-job-response');
          expect(JSON.parse(res.text)).to.deep.equal(JSON.parse(expectedResponse));
          done();
        });
    });

    it('responds with jobs with resources', (done) => {
      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor({ pipelinesNames: ['pipeline1', 'pipeline2'] }));

      const p1Jobs = builders.buildJobsFor({
        pipelineName: 'pipeline1',
        jobNames: ['job1'],
      });
      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, p1Jobs);

      const p2Jobs = builders.buildJobsFor({
        pipelineName: 'pipeline2',
        jobNames: ['job1'],
      });
      concourse.getJobs('pipeline2', 'Bearer some-token')
        .reply(200, p2Jobs);

      const resource1 = builders.buildResourceFor({
        resourceName: 'resource1',
        resourceType: 'semver',
        resourceVersion: '0.1.0',
      });
      concourse.getJobResources('pipeline1-job1-id', 'Bearer some-token')
        .reply(200, builders.buildResourcesFor({ resources: [resource1] }));

      const resource2 = builders.buildResourceFor({
        resourceName: 'resource2',
        resourceType: 'git',
        resourceVersion: 'cd1e2bd19e03a81132a23b2025920577f84e37',
      });
      concourse.getJobResources('pipeline2-job1-id', 'Bearer some-token')
        .reply(200, builders.buildResourcesFor({ resources: [resource2] }));

      chai.request(app)
        .get('/job-stats.json')
        .query({ resources: 'inputs' })
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readJsonFile('success-response-with-resources');
          expect(JSON.parse(res.text)).to.deep.equal(JSON.parse(expectedResponse));
          done();
        });
    });

    it('responds with jobs with no resources', (done) => {
      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor({ pipelinesNames: ['pipeline1', 'pipeline2'] }));

      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipelineName: 'pipeline1',
          jobNames: ['job1'],
        }));

      concourse.getJobs('pipeline2', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipelineName: 'pipeline2',
          jobNames: ['job1'],
        }));

      concourse.getJobResources('pipeline1-job1-id', 'Bearer some-token')
        .reply(200, builders.buildResourcesFor({ resources: [] }));

      concourse.getJobResources('pipeline2-job1-id', 'Bearer some-token')
        .reply(200, builders.buildResourcesFor({ resources: [] }));

      chai.request(app)
        .get('/job-stats.json')
        .query({ resources: 'inputs' })
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readJsonFile('success-response-with-empty-resources');
          expect(JSON.parse(res.text)).to.deep.equal(JSON.parse(expectedResponse));
          done();
        });
    });
  });
});