const CognitoJwtVerifier = require("cognito-jwt-verifier");

module.exports = function createAuthMiddleware(requireGroups = []) {
    return async function authMiddleware(req, res, next) {
        let decodedToken;

        try {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) {
                res.status(401).json({
                    error: "Access denied. User has to be authenticated first."
                });
                return;
            }
            const token = req.headers.authorization.split(' ')[1];
            decodedToken = await verifyAndDecodeToken(token);
        } catch (e) {
            const message = typeof e === 'string' ? e : "Couldn't process token";
            res.status(401).json({
                error: `Access denied. ${message}`
            });
        }

        const userGroups = decodedToken['cognito:groups'] || [];

        if (!requireGroups.every(requiredGroup => userGroups.includes(requiredGroup))) {
            res.status(403).json({
                error: "Access denied. User has no credentials."
            })
        }

        next();
    }
}

let verifier = new CognitoJwtVerifier();

async function verifyAndDecodeToken(token) {
    try {
        return await verifier.verifyToken({
            token: token,
            aws_region: process.env.COGNITO_AWS_REGION,
            userpool_id: process.env.COGNITO_USER_POOL_ID,
            userpool_client_id: process.env.COGNITO_USERPOOL_CLIENT_ID
        })
    } catch (e) {
        throw(e)
    }
}
