// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml
const express = require('express');
const xml = require('xml');
const morgan = require('morgan');

const config = require('./config');
const Concourse = require('./concourse');

const app = express();
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
    webUrl: config.baseApiUri.origin + job.finished_build.url
  });

app.use(morgan('combined'));

app.get(['/', '/health'], async (req, res) => {
  res.sendStatus(200);
});

app.get('/cc.xml', async (req, res) => {
  try {
    const concourse = new Concourse(config.baseApiUri, config.team);

    const basicAuthToken = await concourse.fetchAccessToken(config.authUsername, config.authPassword);

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
    console.error(`Unable to fetch concourse feed. Reason: ${e.message}`);
    return res
      .status(500)
      .send(`Unable to fetch concourse feed. Reason: ${e.message}`);
  }

});

const port = 3000;
app.listen(port, function () {
  console.log(`PlaneSpotter listening on port ${port}!`);
});

module.exports = app;