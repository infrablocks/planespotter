/* eslint-disable consistent-return */
const express = require('express');
const xml = require('xml');
const morgan = require('morgan');

const config = require('./config');
const feed = require('./feed');
const Concourse = require('./concourse');

const app = express();

app.use(morgan('combined'));

app.get(['/', '/health'], async (req, res) => {
  res.sendStatus(200);
});

app.get('/cc.xml', async (req, res) => {
  try {
    const concourse = new Concourse(config.baseApiUri, config.team);

    const basicAuthToken =
      await concourse.fetchAccessToken(config.authUsername, config.authPassword);

    const allPipelines = await concourse.fetchAllPipelines(basicAuthToken);

    const allJobs = await concourse.fetchAllJobs(allPipelines, basicAuthToken);

    const projects = allJobs &&
      allJobs.map(job => feed.toProject(config.baseApiUri, job))
        .filter(Boolean);

    res.set('Content-Type', 'text/xml');
    res.send(xml([{ Projects: projects }]));
  } catch (e) {
    console.error(`Unable to fetch concourse feed. Reason: ${e.message}`);
    return res
      .status(500)
      .send(`Unable to fetch concourse feed. Reason: ${e.message}`);
  }
});


app.get('/job-stats', async (req, res) => {
  try {
    const concourse = new Concourse(config.baseApiUri, config.team);

    const basicAuthToken =
      await concourse.fetchAccessToken(config.authUsername, config.authPassword);

    const allPipelines = await concourse.fetchAllPipelines(basicAuthToken);

    const allJobs = await concourse.fetchAllJobs(allPipelines, basicAuthToken);

    const projects = allJobs &&
      allJobs.map(job => feed.toJobStats(config.baseApiUri, job))
        .filter(Boolean);
    res.set('Content-Type', 'application/json');
    res.send(projects);
  } catch (e) {
    console.error(`Unable to fetch concourse feed. Reason: ${e.message}`);
    return res
      .status(500)
      .send(`Unable to fetch concourse feed. Reason: ${e.message}`);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`PlaneSpotter listening on port ${port}!`);
});

module.exports = app;
