// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const express = require('express');
const app = express();
const { URL } = require('url');
const xml = require('xml');
const request = require('request-promise-native');
const morgan = require('morgan');

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
const AUTH_COOKIE = process.env.AUTH_COOKIE;
if (!AUTH_COOKIE) {
  throw new Error('AUTH_COOKIE not found')
}

const translateStatus = {
  "pending": "Unknown",
  "started": "Unknown",
  "succeeded": "Success",
  "failed": "Failure",
  "errored": "Exception",
  "aborted": "Exception",
};

const toProject = job => ({
  name: job.finished_build.job_name + "#" + job.finished_build.pipeline_name,
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
  const fetchPipelinesUrl = `${baseApiUri}/teams/${TEAM}/pipelines`;
  let allPipelines = [];
  try {
    allPipelines = await request.get({
      url: fetchPipelinesUrl,
      json: true,
      headers: {
        'Cookie': AUTH_COOKIE
      }
    });
  } catch (e) {
    return res
      .status(500)
      .send(`Unable to fetch pipeline information for url ${e.options.url}.
      Reason: ${e.message}`);
  }

  let allJobs = [];
  try {
    allJobs = (await Promise.all(allPipelines.map(pipeline =>
      request.get({
        url: `${baseApiUri}${pipeline.url}/jobs`,
        json: true,
        headers: {
          'Cookie': AUTH_COOKIE
        }
      })
    ))).reduce((xs, x) => xs.concat(x), []);
  } catch (e) {
    return res
      .status(500)
      .send(`Unable to fetch jobs information for url ${e.options.url}.
      Reason: ${e.message}`);
  }

  const projects = allJobs.map(job => ({
    "Project": {
      "_attr": toProject(job)
    }
  }));

  res.set('Content-Type', 'text/xml');
  res.send(xml([{ "Projects": projects }]));
});

const port = 3000;
app.listen(port, function () {
  console.log(`PlaneSpotter listening on port ${port}!`);
});