const { expect, use } = require('chai');
const chai = require('chai');
const chaiXml = require('chai-xml');
const chaiHttp = require('chai-http');
const http = require('http');

const app = require('../../src/app');
const config = require('../../src/config');
const builders = require('../builders');
const helpers = require('../helpers');
const ConcourseInterceptor = require('../interceptors/ConcourseInterceptor');

use(chaiHttp);
use(chaiXml);

describe('App', () => {
  describe('/cc.xml', () => {
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

      concourse.onFetchAllPipelines(token)
        .reply(200, builders.buildPipelinesFor({
          pipelinesNames: [pipeline1Name, pipeline2Name],
        }));

      concourse.onFetchPipeline(pipeline1Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline1Name }));
      concourse.onFetchPipeline(pipeline2Name, token)
        .reply(200, builders.buildPipelineFor({ name: pipeline2Name }));

      concourse.onFetchAllJobs('pipeline1', token)
        .reply(200, builders.buildJobsFor({
          pipelineName: pipeline1Name,
          jobNames: ['job1', 'job2'],
        }));

      concourse.onFetchAllJobs('pipeline2', token)
        .reply(200, builders.buildJobsFor({
          pipelineName: 'pipeline2',
          jobNames: ['job1', 'job2'],
        }));

      chai.request(app)
        .get('/cc.xml')
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readXmlFile('success-response');
          expect(res.text).xml.to.deep.equal(expectedResponse);
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
          builders.buildJobFor({
            pipelineName,
            jobName,
          }),
          emptyJob,
        ]);

      chai.request(app)
        .get('/cc.xml')
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = helpers.readXmlFile('empty-job-response');
          expect(res.text).xml.to.deep.equal(expectedResponse);
          done();
        });
    });
  });
});
