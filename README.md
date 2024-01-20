## README:
Note: 
1. These currently don't contain build stages within the dockerfile, could do within docker-compose?
2. Had trouble setting up the mongo connection, tried localhost and 127.0.0.1, this answer
solved it: https://stackoverflow.com/questions/51011552/mongodb-on-with-docker-failed-to-connect-to-server-localhost27017-on-first-c
Within the docker network you connect via the compose service name:port. As my container
is called mongo I plug that into the connection string.
Could also do this: 'mongodb://172.16.0.1:27017';
3. Getting Watchpack error on /app /app/pages and /app/styles, permissions issue? server hotreloads but actually only does client, when make server changes need to rebuild the frontend image
For hot reloading nextjs within docker, two things are required
4. Ensure docker volume is mapped and for node modules as well
5. Ammend next.js.config to include, along with the default strict mode: (When I uppraded to Next13, it complains saying webpackDevMiddleware is not a valid key)
```
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
```
6. Hot reloading node modules / package.json changes is flaky

## Work todo
Rename frontend to app, and in docker-compose
Add to readme, in the compose file it will create a volume from a hardcoded directory:
   - C:/Users/User/Desktop/NextJsMongoTemplate/datastore/mongodata:/data/db
npm i some env package and add a gitignored .env file

## Contents
This repo contains 3 containers:
1. nextjs typescript frontend container exposed on port 3000, api routes exposed on port 3001? to interact with a...
2. mysql container
3. cypress container

## Usage
docker-compose up -p nextjsmongo up --build
This will build containers: projectprefix_frontend, projectprefix_mongo

## Steps to recreate the repo
1. Created parent DIR

## Frontend
2. cd into parent DIR, run ''npx create-next-app@latest --ts' app name as frontend
  (should have used cypress template)
3. Now able to start with 'npm run dev'
4. Add the dockerfile to the frontend directory
5. Run 'docker build -t frontend .'
6. Now run with 'docker run -p 3000:3000 frontend'

## Backend
7. Added mongodb env variable within .env.loval
8. 'npm i mongoose'
9. Added pags and model files
10. Added mongo data directory

# Cypress
11. Created e2e directory, and ran npm init, install cypress as dev dependency
12. Added docker file
13. Added docker-compose step
14. Added cypress folder and cypress.json
15. Ran container, executing tests