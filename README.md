# Eplimo API

## Features

- Fastify framework
- `fluent-json-schema` for payload validation
- Mongoose for db modelling
- JWT for Authentication
- CORS Support
- ETag Support
- Auto deploy to AWS-EC2 via GitLab [docs](https://medium.com/@adhasmana/how-to-deploy-node-js-app-on-aws-with-gitlab-24fabde1088d)
- Auto deploy to AWS-EC2 via GitHub Actions

## Dependencies

1. Node.js: v16
2. Install yarn package manager for node https://yarnpkg.com/lang/en/docs/install/#debian-stable
3. PM2, process monitor for node, install using `yarn global add pm2`

## Install

### install necessary dependencies

- Run `git clone git@github.com:iathul/lightrains-eplimo-demo.git`
- Run `cd api-lightrains-eplimo-demo`
- Run `nvm use`
- Run `yarn`

### Set up environment variables

- `cp env.sample .env`, and modify as required

### If you have pm2 installed

- You can use `pm2 start ./src/server.js`

### Or manually (dev mode)

- Run `yarn run dev`

## Swagger UI

Swagger is available at http://HOST:PORT/docs

## File Structure

```
.
├── deploy
│   ├── deploy.sh
│   ├── disableHostKeyChecking.sh
│   └── updateAndRestart.sh
├── env.sample
├── LICENSE
├── package.json
├── pm2.json
├── README.md
├── src
│   ├── app.js
│   ├── config
│   │   └── swagger.js
│   ├── models
│   │   └── userModel.js
│   ├── plugins
│   │   ├── authJwt.js
│   │   ├── mongo.js
│   │   ├── README.md
│   │   └── responseApi.js
│   ├── schema
│   │   └── userSchema.js
│   ├── server.js
│   ├── services
│   │   ├── auth.js
│   │   └── user.js
│   └── utils
│       ├── email.js
│       ├── generatorResponse.js
│       └── index.js
└── yarn.lock
```
