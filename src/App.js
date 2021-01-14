import React, { useMemo, useState, useEffect } from 'react';
import Amplify, { Auth, Hub } from 'aws-amplify';

import { awsConfig } from './custom-aws-exports';
import logo from './logo.svg';
import './App.css';

Amplify.configure(awsConfig)

console.log(awsConfig);

function App() {
    const [user, setUser] = useState();
    const [userData, setUserData] = useState();
    const [_, setCustomState] = useState();

    useEffect(() => {
        Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case "signIn":
                    setUser(data);
                    break;
                case "signOut":
                    setUser(null);
                    break;
                case "customOAuthState":
                    setCustomState(data);
                    break;
                default:
                    console.error(`Unknown event: ${event}`)
            }
        });

        Auth.currentAuthenticatedUser()
            .then((user) => setUser(user))
            .catch(() => console.log("Not signed in"));
    }, []);

    useEffect(() => {
        if (user) {
            user.getUserData((err, result) => {
                setUserData(result)
            })
        }
    }, [user])

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

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                {user && (
                    <div>
                        <button onClick={() => Auth.signOut()}>Sign Out {user.getUsername()} {userEmail}</button>
                        <p>User groups: {userGroups.length > 0 ? userGroups.join(', ') : <i>no groups</i>}</p>
                    </div>
                )}
                {!user && <div>
                    <button onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>Open Facebook</button>
                    <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>Open Google</button>
                    <button onClick={() => Auth.federatedSignIn({ provider: 'COGNITO' })}>Open Hosted UI
                    </button>

                </div>}
            </header>
        </div>
    );
}


export default App;
