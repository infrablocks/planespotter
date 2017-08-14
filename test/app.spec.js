const chai = require('chai');
const fs = require('fs');
const path = require('path');
const chaiXml = require('chai-xml');
const chaiHttp = require('chai-http');

const app = require('../src/app');
const config = require('../src/config');
const builders = require('./builders');
const ConcourseInterceptor = require('./interceptors/ConcourseInterceptor');

const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiXml);

describe('App', () => {

  describe('/', () => {
    it('responds with status 200', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('/health', () => {
    it('responds with status 200', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('/cc.xml', () => {
    let concourse;
    beforeEach(() => {
      concourse = new ConcourseInterceptor(config.baseApiUri);
    });
    it('responds with status 200', (done) => {
      concourse.getAuthToken(config.authUsername, config.authPassword)
        .reply(200, {
          type: 'Bearer',
          value: 'some-token'
        });

      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor(['pipeline1', 'pipeline2']));

      concourse.getJobs('pipeline1', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({ pipeline: 'pipeline1', jobs: ['job1', 'job2'] }));

      concourse.getJobs('pipeline2', 'Bearer some-token')
        .reply(200, builders.buildJobsFor({ pipeline: 'pipeline2', jobs: ['job1', 'job2'] }));

      chai.request(app)
        .get('/cc.xml')
        .end((err, res) => {
          expect(res).to.have.status(200);

          const expectedResponse = fs.readFileSync(
            path.join(__dirname, '/resources/success-response.xml'),
            { encoding: 'utf-8' });
          expect(res.text).xml.to.deep.equal(expectedResponse);
          done();
        });
    });

    it('responds with no projects if job has no finished builds', (done) => {
      concourse.getAuthToken(config.authUsername, config.authPassword)
        .reply(200, {
          type: 'Bearer',
          value: 'some-token'
        });

      concourse.getPipelines('Bearer some-token')
        .reply(200, builders.buildPipelinesFor(['pipeline1']));

      let emptyJob = {
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

          const expectedResponse = fs.readFileSync(
            path.join(__dirname, '/resources/empty-job-response.xml'),
            { encoding: 'utf-8' });
          expect(res.text).xml.to.deep.equal(expectedResponse);
          done();
        });
    })
  });
});