exports.buildPipelinesFor = (pipelines) => {
  return pipelines.map((pipeline) => {
    return {
      "id": 1,
      "name": pipeline,
      "url": `/teams/main/pipelines/${pipeline}`
    }
  })
};

exports.buildJobsFor = ({ pipeline, jobs }) => {
  return jobs.map((job) => {
    return {
      "next_build": null,
      "finished_build": {
        "team_name": "main",
        "status": "succeeded",
        "job_name": job,
        "url": `/teams/main/pipelines/${pipeline}/jobs/${job}/builds/2`,
        "pipeline_name": pipeline,
        "end_time": 1502470729
      }
    }
  })
};