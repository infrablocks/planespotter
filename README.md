# Planes Spotter

## Docker image
https://hub.docker.com/r/infrablocks/planespotter

- v5.0.0 add support for concourse 6.0.0 and above
- v4.0.0 add support for concourse 4.0.0 and above

## Needs:

    URL [concourse URL, example: https://ci.server]

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
    [Using node v10.10.0 (npm v6.4.1)]
    npm install

### Start app:
    npm start

### Start in debug mode:
    
    NODE_ENV=production nodemon src/app.js
    
### Start with docker:
    docker build . -t planespotter
    docker run --rm -e TEAM -e URL -e AUTH_USERNAME -e AUTH_PASSWORD -p 3000:3000 -t planespotter
