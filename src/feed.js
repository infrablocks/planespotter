// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const translateStatus = {
  pending: 'Unknown',
  started: 'Unknown',
  succeeded: 'Success',
  failed: 'Failure',
  errored: 'Failure',
  aborted: 'Exception',
};

const _mapCCXML = (baseUri, job) => ({
  name: `${job.finished_build.pipeline_name}#${job.finished_build.job_name}`,
  activity: job.next_build ? 'Building' : 'Sleeping',
  lastBuildStatus: translateStatus[job.finished_build.status],
  lastBuildLabel: job.finished_build.pipeline_name,
  lastBuildTime: job.finished_build.end_time
  && new Date(job.finished_build.end_time * 1000).toISOString(),
  webUrl: baseUri.origin + job.finished_build.url,
});

const _mapJson = (baseUri, job) => ({
  id: job.finished_build.id,
  name: `${job.finished_build.pipeline_name}#${job.finished_build.job_name}`,
  activity: job.next_build ? 'Building' : 'Sleeping',
  lastBuildStatus: translateStatus[job.finished_build.status],
  lastBuildLabel: job.finished_build.pipeline_name,
  lastBuildTime: job.finished_build.end_time
  && new Date(job.finished_build.end_time * 1000).toISOString(),
  webUrl: baseUri.origin + job.finished_build.url,
});

const _mapResources = resources => resources.inputs
  && resources.inputs.map(input => ({
    name: input.name,
    type: input.type,
    version: input.version,
  }));

exports.toProject = (baseUri, job) => job.finished_build && {
  Project: {
    _attr: _mapCCXML(baseUri, job),
  },
};

exports.toJobStats = (baseUri, job) => job.finished_build && _mapJson(baseUri, job);
exports.toJobResources = resources => _mapResources(resources);

