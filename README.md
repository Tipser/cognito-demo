## What it is ?
Demo of AWS Cognito based authentication client + server application.

The client triggers authentication of user, and stores user's session. It also performs calls to backend, which is able to verify the token to check if user is authenticated.

There is also authorization example, that checks for existence for a specific group in user's data.

### Client

React based SPA.

### Backend

Simple Node.js "REST" api.

### AWS Services

Cognito as Identity and User Pool. It provides authentication via OAUTH 2.0 OpenID Connect.

## Local - Development

```
yarn install
yarn start
```

It starts the client listening on http://localhost:3000 and the server listening http://localhost:3001 

## Deployment

### Deployment - frontend

#### Requirements:
- npm packages installed globally: yarn, netlify-cli (
  - `npm install -g yarn netlify-cli`
- amplify initialized `cd frontend && amplify init` (`amplify init` is an interactive command)


#### Deployment process:
```
cd frontend
amplify pull
REACT_APP_APPLICATION_URL=https://test-aws-amplify.netlify.app REACT_APP_API_URL=http://cogni-Publi-CS800GWXQ8V8-883701902.eu-west-1.elb.amazonaws.com yarn build
netlify deploy --prod 
```

> `netlify deploy --prod` is interactive command. It will ask you for "publish directory" - enter "build";

> You can also provide env variables by coping `.env.example` into `.env` and providing values there. 

### Deployment - backend

#### Requirements:

- CLI tools: `copilot` and `aws` installed
- `aws confgiure`
- docker logged into aws ecr
  - `aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 770937179823.dkr.ecr.eu-west-1.amazonaws.com`

#### Deployment process:

```
copilot svc deploy --name load-balancer
```
