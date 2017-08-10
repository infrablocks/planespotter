# cconccourse

# Set up
    npm install

## Needs:

    API_URL [concourse API, example: https://ci.server/api/v1]

    AUTH_COOKIE [cookie to authenticate against concourse, example: ATC-Authorization=Bearer ***]

    PORT [optional, default: 3000]

## Start app:
    node src/app.js

## Start in debug mode:
    
    nodemon src/app.js
    
## Start with docker:
    docker build . -t cconccourse
    docker run -e API_URL -e AUTH_COOKIE -p 3000:3000 -t cconccourse
