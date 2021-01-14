import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Amplify, { Auth, Hub } from 'aws-amplify';

import { awsConfig } from './custom-aws-exports';
import logo from './logo.svg';
import './App.css';

Amplify.configure(awsConfig)

function getUser() {
    return new Promise((resolve, reject) => {
        Auth.currentAuthenticatedUser()
            .then(user => {
                user.getUserData((err, userData) => {
                    if (err) {
                        reject(err);
                    }
                    resolve([user, userData]);
                })
            })
            .catch(e => {
                console.log('Not signed in')
                reject(e);
            });
    });
}

function useSessionUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState();
    const [userData, setUserData] = useState();

    const processUserSigningIn = useCallback(() => {
        setIsLoading(true);

        getUser().then(([user, userData]) => {
            setUser(user);
            setUserData(userData);
        }).finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        processUserSigningIn()
    }, [processUserSigningIn])

    const signOut = useCallback(() => setUser(undefined), []);

    return { isLoading, user, userData, signOut, processUserSigningIn }
}

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
                    signOut()();
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    console.log('Sign in failure', data);
                    break;
                default:
                    console.error(`Unknown event: ${event}`)
            }
        });

        processUserSigningIn();
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
        console.log(payload);
        return payload['cognito:groups'] || [];
    }, [user])

    return (
        <div className="App">
            <header className="App-header">
                {isLoading && <p>Loading...</p>}
                {!isLoading && <div>
                    <img src={logo} className="App-logo" alt="logo"/>
                    {user && (
                        <div>
                            <button onClick={() => Auth.signOut()}>Sign
                                Out {user.getUsername()} {userEmail}</button>
                            <p>User groups: {userGroups.length > 0 ? userGroups.join(', ') : <i>no groups</i>}</p>
                        </div>
                    )}
                    {!user && <div>
                        <button onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>Open Facebook
                        </button>
                        <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>Open Google</button>
                        <button onClick={() => Auth.federatedSignIn({ provider: 'COGNITO' })}>Open Hosted UI
                        </button>

                    </div>}
                </div>}
            </header>
        </div>
    );
}

export default App;
