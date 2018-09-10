// https://github.com/jenkinsci/cctray-xml-plugin/tree/master/src/main/java/org/jenkinsci/plugins/ccxml

const translateStatus = {
  pending: 'Unknown',
  started: 'Unknown',
  succeeded: 'Success',
  failed: 'Failure',
  errored: 'Failure',
  aborted: 'Exception',
};

const _mapCCXML = (url, job) => ({
  name: `${job.finishedBuild.pipelineName}#${job.finishedBuild.jobName}`,
  activity: job.nextBuild ? 'Building' : 'Sleeping',
  lastBuildStatus: translateStatus[job.finishedBuild.status],
  lastBuildLabel: job.finishedBuild.pipelineName,
  lastBuildTime: job.finishedBuild.endTime
  && new Date(job.finishedBuild.endTime * 1000).toISOString(),
  webUrl: `${url}api/v1${job.finishedBuild.apiUrl}`,
});

const _mapJson = (url, job) => ({
  id: job.finishedBuild.id,
  pipeline: job.finishedBuild.pipelineName,
  job: job.finishedBuild.jobName,
  name: `${job.finishedBuild.pipelineName}#${job.finishedBuild.jobName}`,
  activity: job.nextBuild ? 'Building' : 'Sleeping',
  lastBuildStatus: translateStatus[job.finishedBuild.status],
  lastBuildLabel: job.finishedBuild.pipelineName,
  lastBuildTime: job.finishedBuild.endTime
  && new Date(job.finishedBuild.endTime * 1000).toISOString(),
  webUrl: `${url}api/v1${job.finishedBuild.apiUrl}`,
});

const _mapResources = resources => resources.inputs
  && resources.inputs.map(({ resource: name, type, version }) => ({
    name,
    type,
    version,
  }));

exports.toProject = (url, job) => job.finishedBuild && {
  Project: {
    _attr: _mapCCXML(url, job),
  },
};

exports.toJobStats = (url, job) => job.finishedBuild && _mapJson(url, job);
exports.toJobResources = resources => _mapResources(resources);

