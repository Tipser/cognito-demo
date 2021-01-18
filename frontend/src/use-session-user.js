import { useCallback, useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

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

export function useSessionUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState();
    const [userData, setUserData] = useState();

    const processUserSigningIn = useCallback(() => {
        setIsLoading(true);

        getUser().then(([user, userData]) => {
            setUser(user);
            setUserData(userData);
        }).catch((e) => {
            if (e !== 'The user is not authenticated') {
                throw e;
            }
        }).finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        processUserSigningIn()
    }, [processUserSigningIn])

    const signOut = useCallback(() => setUser(undefined), []);

    return { isLoading, user, userData, signOut, processUserSigningIn }
}
