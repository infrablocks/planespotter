// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const express = require('express');
const app = express();
const { URL } = require('url');
const xml = require('xml');
const request = require('request-promise-native');
const morgan = require('morgan');
const Concourse = require('./concourse');

let baseApiUri;
if (!process.env.API_URL) {
  throw new Error('API_URL not found');
} else {
  baseApiUri = new URL(process.env.API_URL);
}
const TEAM = process.env.TEAM;
if (!TEAM) {
  throw new Error('Concourse TEAM not found');
}
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;
if (!AUTH_USERNAME || !AUTH_PASSWORD) {
  throw new Error('AUTH_USERNAME/AUTH_PASSWORD not found')
}

const translateStatus = {
  "pending": "Unknown",
  "started": "Unknown",
  "succeeded": "Success",
  "failed": "Failure",
  "errored": "Exception",
  "aborted": "Exception",
};

const toProject = job => (
  job.finished_build && {
    name: job.finished_build.pipeline_name + "#" + job.finished_build.job_name,
    activity: job.next_build ? "Building" : "Sleeping",
    lastBuildStatus: translateStatus[job.finished_build.status],
    lastBuildLabel: job.finished_build.pipeline_name,
    lastBuildTime: job.finished_build.end_time,
    webUrl: baseApiUri.origin + job.finished_build.url
  });

app.use(morgan('combined'));

app.get(['/', '/health'], async (req, res) => {
  res.sendStatus(200);
});

app.get('/cc.xml', async (req, res) => {
  try {
    const concourse = new Concourse(baseApiUri, TEAM);

    const basicAuthToken = await concourse.fetchAccessToken(AUTH_USERNAME, AUTH_PASSWORD);

    const allPipelines = await concourse.fetchAllPipelines(basicAuthToken);

    const allJobs = await concourse.fetchAllJobs(allPipelines, basicAuthToken);

    const projects = allJobs && allJobs.map(job => ({
      "Project": {
        "_attr": toProject(job)
      }
    }));
    res.set('Content-Type', 'text/xml');
    res.send(xml([{ "Projects": projects }]));
  } catch (e) {
    return res
      .status(500)
      .send(`Unable to fetch concourse feed. Reason: ${e.message}`);
  }

});

const port = 3000;
app.listen(port, function () {
  console.log(`PlaneSpotter listening on port ${port}!`);
});