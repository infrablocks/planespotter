# cconccourse

## Docker
https://hub.docker.com/r/nningego/planespotter/

# Set up
    npm install

## Needs:

    API_URL [concourse API, example: https://ci.server/api/v1]

    AUTH_COOKIE [cookie to authenticate against concourse, example: ATC-Authorization=Bearer ***]
    
    TEAM [concourse team name]

## Start app:
    node src/app.js

## Start in debug mode:
    
    nodemon src/app.js
    
## Start with docker:
    docker build . -t planespotter
    docker run --rm -e TEAM -e API_URL -e AUTH_COOKIE -p 3000:3000 -t planespotter

## Concourse job stats on: http://localhost:3000/cc.xml
