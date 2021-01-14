import React, { useState, useEffect } from 'react';
import Amplify, { Auth, Hub } from 'aws-amplify';

import awsconfig from './aws-exports';
import logo from './logo.svg';
import './App.css';

Amplify.configure(awsconfig)

function App() {
    const [user, setUser] = useState();

    useEffect(() => {
        Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case "signIn":
                    this.setState({ user: data });
                    break;
                case "signOut":
                    this.setState({ user: null });
                    break;
                case "customOAuthState":
                    this.setState({ customState: data });
                    break;
                default:
                    console.error(`Unknown event: ${event}`)
            }
        });

        Auth.currentAuthenticatedUser()
            .then(returnedUser => setUser({ user: returnedUser }))
            .catch(() => console.log("Not signed in"));
    }, []);


    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                {user && <button onClick={() => Auth.signOut()}>Sign Out {user.getUsername()}</button>}
                {!user && <div>
                    <button onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>Open Facebook</button>
                    <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>Open Google</button>
                    <button onClick={() => Auth.federatedSignIn()}>Open Hosted UI</button>

                </div>}
            </header>
        </div>
    );
}


export default App;
