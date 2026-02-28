import prisma from "../model/db";

async function findOAuthUserByProvider(provider, providerUserId){
    const findUser = await prisma.OAuthUser.findUnique({
        where : {
            provider_providerUserId: {
            provider : provider,
            providerUserId : providerUserId
            }
        }
    });
    return findUser;
}


async function findOAuthUserById(id){
    const findUser = await prisma.oAuthUser.findUnique({
        where : 
        {
         id
        }
    })
    return findUser;
}

async function upsertOAuthUser(data){
    const user = await prisma.OAuthUser.upsert({
        where : {
            provider_providerUserId : {
                provider : data.provider,
                providerUserId : data.providerUserId,
            }
        },
        update : {
            name : data.name,
            avatarUrl : data.avatarUrl
        },
        create : {
            email : data.email,
            name : data.email,
            avatarUrl : data.avatarUrl,
            provider :data.provider,
            providerUserId : data.providerUserId,
        }
    });
    return user;
}

async function createOAuthToken(userId , provider, accessToken , refreshToken , expiresAt){
    const createUser = await prisma.OAuthToken.create({
            data : {
                userId : userId,
                provider : provider,
                accessToken : accessToken,
                refreshToken : refreshToken,
                expiresAt : expiresAt
            }
    });
    return createUser;
}

async function updateOAuthToken(userId , provider, accessToken , refreshToken , expiresAt){
    const updateToken = await prisma.OAuthToken.updateMany({
        where : {
            userId,
            provider
        },
        data : {
            accessToken : accessToken,
            refreshToken : refreshToken,
            expiresAt : expiresAt
        }
    });
    return updateToken;
}

async function createRefreshToken(userId , token , expiresAt){
    const createRefreshToken = await prisma.OAuthRefreshToken.create({
            data : {
                userId : userId,
                token : token,
                expiresAt : expiresAt
            }
        }
    )
    return createRefreshToken;
}

async function findRefreshToken(token){
    const findRefreshToken = await prisma.OAuthRefreshToken.findUnique({
        where : {
            token
        }
}); 
return findRefreshToken;
}

async function deleteRefreshToken(token){
    const deleteToken = await prisma.OAuthRefreshToken.delete({
        where : {
            token
        }
    })
    return deleteToken
}

async function deleteALLUserRefreshTokens(userId) { // logout from all devices
    const deleteFromAllDevices = await prisma.OAuthRefreshToken.deleteMany({
        where : {
            userId
        }
    })
    return deleteFromAllDevices;
}


export { 
    findOAuthUserById,
    findOAuthUserByProvider,
    upsertOAuthUser,
    createOAuthToken,
    updateOAuthToken,
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteALLUserRefreshTokens
}

