const chance = require('chance').Chance();
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');

const _pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const _randomLowerHex = (length) => {
  let count = length;
  if (typeof count === 'undefined') {
    count = 1;
  }

  let wholeString = '';
  for (let i = 0; i < count; i += 1) {
    wholeString += chance.pickone([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f',
    ]);
  }

  return wholeString;
};
const _randomCsrfToken = () => _randomLowerHex(64);
const _randomBearerToken = (overrides = {}, options = {}) => {
  const resolvedData = {
    csrf: _randomCsrfToken(),
    teamName: 'main',
    isAdmin: true,
    ...overrides,
  };
  const resolvedOptions = {
    algorithm: 'RS256',
    expiresIn: '1 day',
    ...options,
  };
  const rsaPrivateKey = new NodeRSA({ b: 512 })
    .exportKey('pkcs8-private-pem');

  return jwt.sign(resolvedData, rsaPrivateKey, resolvedOptions);
};

exports.buildToken = ({
  bearerToken = _randomBearerToken(),
} = {}) => ({
  access_token: bearerToken,
  token_type: 'Bearer',
  expiry: '2050-09-10T07:50:24.622839253Z',
});

exports.buildTeam = ({
  id = chance.natural(),
  name = 'main',
} = {}) => ({
  id,
  name,
});

exports.buildPipelineFor = ({
  id = chance.natural(),
  name = chance.word(),
} = {}) => ({
  id,
  name,
});

exports.buildPipelinesFor = ({
  pipelinesNames = [chance.word()],
} = {}) => pipelinesNames.map((pipelineName) => exports.buildPipelineFor({ name: pipelineName }));

exports.buildJobFor = ({
  pipelineName = chance.word(),
  jobName = chance.word(),
  finishedBuild = exports.buildBuildFor({ pipelineName, jobName }),
} = {}) => ({
  next_build: null,
  finished_build: finishedBuild,
});

exports.buildBuildFor = ({
  teamName = 'main',
  status = 'succeeded',
  jobName = chance.word(),
  pipelineName = chance.word(),
  apiUrl = `/teams/main/pipelines/${pipelineName}/jobs/${jobName}/builds/2`,
  endTime = 1502470729,
  id = `${pipelineName}-${jobName}-id`,
} = {}) => ({
  id,
  team_name: teamName,
  status,
  job_name: jobName,
  pipeline_name: pipelineName,
  api_url: apiUrl,
  end_time: endTime,
});

exports.buildResourceFor = ({
  resourceName = chance.word(),
  resourceType = _pickRandom(['git', 'semver']),
  resourceVersion = chance.guid(),
} = {}) => ({
  name: resourceName,
  resource: resourceName,
  type: resourceType,
  version: { thing: resourceVersion },
});

exports.buildResourcesFor = ({ resources }) => ({
  inputs: resources,
});

exports.buildJobsFor = ({
  pipelineName = chance.word(),
  jobNames = [chance.word()],
  jobs = jobNames.map((jobName) => this.buildJobFor({ pipelineName, jobName })),
} = {}) => jobs;
