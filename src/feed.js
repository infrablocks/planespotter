// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const translateStatus = {
  'pending': 'Unknown',
  'started': 'Unknown',
  'succeeded': 'Success',
  'failed': 'Failure',
  'errored': 'Failure',
  'aborted': 'Exception',
};

const _map = (baseUri, job) => {
  return {
    name: job.finished_build.pipeline_name + '#' + job.finished_build.job_name,
    activity: job.next_build ? 'Building' : 'Sleeping',
    lastBuildStatus: translateStatus[job.finished_build.status],
    lastBuildLabel: job.finished_build.pipeline_name,
    lastBuildTime: job.finished_build.end_time && new Date(job.finished_build.end_time * 1000).toISOString(),
    webUrl: baseUri.origin + job.finished_build.url
  }
};

exports.toProject = (baseUri, job) => {
  return job.finished_build && {
    'Project': {
      '_attr': _map(baseUri, job)
    }
  }
};