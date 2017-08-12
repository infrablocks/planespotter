# Planes Spotter

## Docker image
https://hub.docker.com/r/nningego/planespotter

# Tests
    npm test
    
# Set up
    npm install

## Needs:

    API_URL [concourse API, example: https://ci.server/api/v1]

    AUTH_USERNAME/AUTH_PASSWORD [basic auth credentials]
    
    TEAM [concourse team name. Default: main]

## Start app:
    npm start

## Start in debug mode:
    
    NODE_ENV=production nodemon src/app.js
    
## Start with docker:
    docker build . -t planespotter
    docker run --rm -e TEAM -e API_URL -e AUTH_USERNAME -e AUTH_PASSWORD -p 3000:3000 -t planespotter

## Concourse job stats on: http://localhost:3000/cc.xml
