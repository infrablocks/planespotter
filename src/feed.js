// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const translateStatus = {
  "pending": "Unknown",
  "started": "Unknown",
  "succeeded": "Success",
  "failed": "Failure",
  "errored": "Exception",
  "aborted": "Exception",
};

exports.toProject = (baseUri, job) => {
  return job.finished_build && {
    name: job.finished_build.pipeline_name + "#" + job.finished_build.job_name,
    activity: job.next_build ? "Building" : "Sleeping",
    lastBuildStatus: translateStatus[job.finished_build.status],
    lastBuildLabel: job.finished_build.pipeline_name,
    lastBuildTime: job.finished_build.end_time,
    webUrl: baseUri.origin + job.finished_build.url
  }
};