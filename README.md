# Planes Spotter

## Docker image
https://hub.docker.com/r/nningego/planespotter

- v3.0.0 supports concourse 3.14.1 and above

## Needs:

    API_URL [concourse API, example: https://ci.server/api/v1]

    AUTH_USERNAME/AUTH_PASSWORD [basic auth credentials]
    
    TEAM [concourse team name. Default: main]
    
## Concourse job stats on: 
    http://localhost:3000/cc.xml
  
## Concourse job stats in JSON on: 
    http://localhost:3000/job-stats.json
  
## Concourse job stats with input resources in JSON on:
    http://localhost:3000/job-stats.json?resources=inputs

## Contribute  

### Tests
    npm test
    
### Set up 
    [Using v8.11.1 (npm v5.3.0)]
    npm install

### Start app:
    npm start

### Start in debug mode:
    
    NODE_ENV=production nodemon src/app.js
    
### Start with docker:
    docker build . -t planespotter
    docker run --rm -e TEAM -e API_URL -e AUTH_USERNAME -e AUTH_PASSWORD -p 3000:3000 -t planespotter
    
### TODOs:

[] Upgrade npm dependencies

[] Use http://github.com/infrablocks/concourse.js
