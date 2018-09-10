const { expect, use } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');

const app = require('../../src/app');
const config = require('../../src/config');
const builders = require('./../builders');
const helpers = require('../helpers');
const ConcourseInterceptor = require('./../interceptors/ConcourseInterceptor');

use(chaiHttp);

describe('App', () => {
  describe('/job-stats.json', () => {
    let concourse;
    let server;
    let token;

    beforeEach(() => {
      token = builders.buildToken();
      concourse = new ConcourseInterceptor(
        config.url,
        config.teamName,
        config.authentication,
      );
      concourse.onGetInfo()
        .reply(200, {
          version: '4.1.0',
        });
      concourse.onCreateToken()
        .reply(200, token);
      concourse.onFetchAllTeams(token)
        .reply(200, [builders.buildTeam({ name: config.teamName })]);

      server = http.createServer(concourse.getHandler());
      server.listen(1337);
    });

    afterEach((done) => {
      server.close(done);
    });

    it('responds with status 200', (done) => {
      const pipeline1Name = 'pipeline1';
      const pipeline2Name = 'pipeline2';
      const job1Name = 'job1';
      const job2Name = 'job2';

      concourse.onFetchAllPipelines(token)
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: [pipeline1Name, pipeline2Name],
        }));
      concourse.onFetchPipeline(pipeline1Name, token)
        .reply(200, builders.buildPipelineFor({
          name: pipeline1Name,
        }));
      concourse.onFetchPipeline(pipeline2Name, token)
        .reply(200, builders.buildPipelineFor({
          name: pipeline2Name,
        }));

      concourse.onFetchAllJobs(pipeline1Name, token)
        .reply(200, builders.buildJobsFor({
          pipelineName: pipeline1Name,
          jobNames: [job1Name, job2Name],
        }));

      concourse.onFetchAllJobs(pipeline2Name, token)
        .reply(200, builders.buildJobsFor({
          pipelineName: pipeline2Name,
          jobNames: [job1Name, job2Name],
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
      const pipelineName = 'pipeline1';
      const jobName = 'job1';

      concourse.onFetchAllPipelines(token)
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: [pipelineName],
        }));
      concourse.onFetchPipeline(pipelineName, token)
        .reply(200, builders.buildPipelineFor({ name: pipelineName }));

      const emptyJob = {
        next_build: null,
        finished_build: null,
      };
      concourse.onFetchAllJobs(pipelineName, token)
        .reply(200, [
          builders.buildJobFor({ pipelineName, jobName }),
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
      const pipeline1Name = 'pipeline1';
      const pipeline2Name = 'pipeline2';
      const job1Name = 'job1';

      concourse.onFetchAllPipelines(token)
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: [pipeline1Name, pipeline2Name],
        }));
      concourse.onFetchPipeline(pipeline1Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline1Name }));
      concourse.onFetchPipeline(pipeline2Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline2Name }));

      const p1Job = builders.buildJobFor({
        pipelineName: pipeline1Name,
        jobName: job1Name,
      });
      concourse.onFetchAllJobs(pipeline1Name, token)
        .reply(200, [p1Job]);

      const p2Job = builders.buildJobFor({
        pipelineName: pipeline2Name,
        jobName: job1Name,
      });
      concourse.onFetchAllJobs(pipeline2Name, token)
        .reply(200, [p2Job]);

      const resource1 = builders.buildResourceFor({
        resourceName: 'resource1',
        resourceType: 'semver',
        resourceVersion: '0.1.0',
      });
      concourse.onFetchBuild(p1Job.finished_build.id, token)
        .reply(200, builders.buildBuildFor({ id: p1Job.finished_build.id }));
      concourse.onFetchBuildResources(p1Job.finished_build.id, token)
        .reply(200, builders.buildResourcesFor({ resources: [resource1] }));

      const resource2 = builders.buildResourceFor({
        resourceName: 'resource2',
        resourceType: 'git',
        resourceVersion: 'cd1e2bd19e03a81132a23b2025920577f84e37',
      });
      concourse.onFetchBuild(p2Job.finished_build.id, token)
        .reply(200, builders.buildBuildFor({ id: p2Job.finished_build.id }));
      concourse.onFetchBuildResources(p2Job.finished_build.id, token)
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
      const pipeline1Name = 'pipeline1';
      const pipeline2Name = 'pipeline2';

      concourse.onFetchAllPipelines(token)
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: [pipeline1Name, pipeline2Name],
        }));
      concourse.onFetchPipeline(pipeline1Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline1Name }));
      concourse.onFetchPipeline(pipeline2Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline2Name }));

      const job1Name = 'job1';

      const job1 = builders.buildJobFor({
        pipelineName: pipeline1Name,
        jobName: job1Name,
      });
      concourse.onFetchAllJobs(pipeline1Name, token)
        .reply(200, [job1]);

      const job2 = builders.buildJobFor({
        pipelineName: pipeline2Name,
        jobName: job1Name,
      });
      concourse.onFetchAllJobs(pipeline2Name, token)
        .reply(200, [job2]);

      concourse.onFetchBuild(job1.finished_build.id, token)
        .reply(200, builders.buildBuildFor({ id: job1.finished_build.id }));
      concourse.onFetchBuildResources(job1.finished_build.id, token)
        .reply(200, builders.buildResourcesFor({ resources: [] }));

      concourse.onFetchBuild(job2.finished_build.id, token)
        .reply(200, builders.buildBuildFor({ id: job2.finished_build.id }));
      concourse.onFetchBuildResources(job2.finished_build.id, token)
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
