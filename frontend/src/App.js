import React, { useMemo, useEffect } from 'react';
import Amplify, { Auth, Hub } from 'aws-amplify';

import { awsConfig } from './custom-aws-exports';
import logo from './logo.svg';
import './App.css';
import { useSessionUser } from './use-session-user';
import { useHelloWorldApiRequests } from './use-hello-world-callbacks';

Amplify.configure(awsConfig)

function App() {
    const { processUserSigningIn, userData, user, isLoading, signOut } = useSessionUser();

    useEffect(() => {
        Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    processUserSigningIn();
                    break;
                case 'signOut':
                    signOut();
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    console.log('Sign in failure', data);
                    break;
                default:
                    console.error(`Unknown event: ${event}`)
            }
        });
    }, [processUserSigningIn, signOut]);

    const userEmail = useMemo(() => {
        if (!userData) {
            return undefined;
        }

        const emailAttribute = userData.UserAttributes.find(attr => attr.Name === "email");

        if (!emailAttribute) {
            return undefined
        }

        return emailAttribute.Value;
    }, [userData])

    const userGroups = useMemo(() => {
        if (!user) {
            return [];
        }

        const payload = user.getSignInUserSession().getAccessToken().decodePayload()
        return payload['cognito:groups'] || [];
    }, [user])

    const jwtIdToken = useMemo(() => {
        if (!user) {
            return undefined;
        }
        return user.getSignInUserSession().getIdToken().getJwtToken()
    }, [user])


    const { doAuthorizedRequest, doAuthenticatedRequest, doAnonymousRequest } = useHelloWorldApiRequests(jwtIdToken)

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    {isLoading && <p>Loading...</p>}
                    {!isLoading && <>
                        <img src={logo} className="App-logo" alt="logo"/>
                        {user && (
                            <>
                                <div>
                                    <button onClick={() => Auth.signOut()}>Sign
                                        Out {user.getUsername()} {userEmail}</button>
                                    <p>User groups: {userGroups.length > 0 ? userGroups.join(', ') :
                                        <i>no groups</i>}</p>
                                </div>
                                <label>
                                    <p style={{ textAlign: 'left', fontSize: '16px' }}>Id Token</p>
                                    <textarea defaultValue={jwtIdToken}
                                              style={{ maxWidth: '100%', width: '800px', marginBottom: '1em' }}
                                              rows={16}/>
                                </label>
                            </>
                        )}
                        {!user && <div>
                            <button onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>Open Facebook
                            </button>
                            <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>Open Google</button>
                            <button onClick={() => Auth.federatedSignIn({ provider: 'COGNITO' })}>Open Hosted UI
                            </button>

                        </div>}
                    </>}
                    <p style={{ textAlign: 'left', fontSize: '16px' }}>Requests to backend resources</p>
                    <div style={{ display: 'flex' }}>
                        <button onClick={doAnonymousRequest}>Request "hello world" for anonymous</button>
                        <button onClick={doAuthenticatedRequest}>Request "hello world" for authenticated
                        </button>
                        <button onClick={doAuthorizedRequest}>Request "hello world" for group 'se-order-write'
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default App;

