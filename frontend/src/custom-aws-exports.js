import awsConfig from './aws-exports';

const applicationHost = process.env.REACT_APP_APPLICATION_URL || 'http://localhost:3000';

awsConfig.oauth = {
    ...awsConfig.oauth,
    redirectSignIn: `${applicationHost}/token`,
    redirectSignOut: `${applicationHost}/sign-out`
};

export { awsConfig }
