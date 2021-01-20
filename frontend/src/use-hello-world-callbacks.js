import { useCallback, useMemo } from 'react';
import ky from 'ky';

export function useHelloWorldApiRequests(authToken) {


    async function safelyProcessRequest(callbackResponse) {
        let response;

        try {
            response = await callbackResponse()
        } catch (e) {
            if (e.response) {
                console.log('status', e.response.status);
                console.log('body', await e.response.text());
            } else {
                console.error(e);
            }
            return;
        }

        try {
            console.log("Status code", response.status);
            const json = await response.json();
            console.log(json);
        } catch (e) {
            console.error('Couldn\'t process JSON');
        }
    }

    const headers = useMemo(() => {
        if (!authToken) {
            return {};
        }

        return {
            Authorization: `Bearer ` + authToken
        }
    }, [authToken])

    const doAnonymousRequest = useCallback(async () => {
        safelyProcessRequest(() => ky.get(`${getApiUrl()}/anonymous/hello-world`, { headers }))
    }, [headers])

    const doAuthenticatedRequest = useCallback(async () => {
        safelyProcessRequest(() => ky.get(`${getApiUrl()}/authenticated/hello-world`, { headers }))
    }, [headers])

    const doAuthorizedRequest = useCallback(async () => {
        safelyProcessRequest(() => ky.get(`${getApiUrl()}/authorized/hello-world`, { headers }))
    }, [headers])

    return {
        doAnonymousRequest, doAuthenticatedRequest, doAuthorizedRequest
    }
}

function getApiUrl() {
    return process.env.REACT_APP_API_URL;
}
