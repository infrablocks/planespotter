const { expect, use } = require('chai');
const chai = require('chai');
const chaiXml = require('chai-xml');
const chaiHttp = require('chai-http');

const app = require('../../src/app');

use(chaiHttp);
use(chaiXml);

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
});
