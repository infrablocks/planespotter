const { expect, use } = require('chai');
const chai = require('chai');
const chaiXml = require('chai-xml');
const chaiHttp = require('chai-http');

const app = require('../../src/app');
const config = require('../../src/config');
const builders = require('./../builders');
const helpers = require('./../helpers');
const ConcourseInterceptor = require('./../interceptors/ConcourseInterceptor');

use(chaiHttp);
use(chaiXml);

describe('App', () => {
  describe('/cc.xml', () => {
    let concourse;
    beforeEach(() => {
      concourse = new ConcourseInterceptor(config.baseApiUri);
    });

    it('responds with status 200', (done) => {
      concourse.getAuthToken(config.authUsername, config.authPassword)
        .reply(200, {
          type: 'Bearer',
          value: 'some-token',
        });

      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor(['pipeline1', 'pipeline2']));

      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipeline: 'pipeline1',
          jobs: ['job1', 'job2'],
        }));

      concourse.getJobs('pipeline2', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({
          pipeline: 'pipeline2',
          jobs: ['job1', 'job2'],
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
      concourse.getAuthToken(config.authUsername, config.authPassword)
        .reply(200, {
          type: 'Bearer',
          value: 'some-token',
        });

      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor(['pipeline1']));

      const emptyJob = {
        next_build: null,
        finished_build: null,
      };
      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, [
          builders.buildJobFor('pipeline1', 'job1'),
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
