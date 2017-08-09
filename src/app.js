// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const express = require('express');
const app = express();
const xml = require('xml');
const request = require('request-promise-native');

const API_URL = process.env.API_URL;

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
  webUrl: API_URL + job.finished_build.url
});

app.get('/cc.xml', async (req, res) => {
  const allPipelines = await request.get({
    url: API_URL + '/teams/main/pipelines',
    json: true,
    headers: {
      'Cookie': process.env.AUTH_COOKIE
    }
  });

  const allJobs = (await Promise.all(allPipelines.map(pipeline =>
    request.get({
      url: API_URL + pipeline.url + '/jobs',
      json: true,
      headers: {
        'Cookie': process.env.AUTH_COOKIE
      }
    })
  ))).reduce((xs, x) => xs.concat(x), []);

  const projects = allJobs.map(job => ({
    "Project": {
      "_attr": toProject(job)
    }
  }));

  res.set('Content-Type', 'text/xml');
  res.send(xml([{ "Projects": projects }]));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`CConccourse listening on port ${port}!`);
});