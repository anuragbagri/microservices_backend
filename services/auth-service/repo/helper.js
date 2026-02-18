import prisma from "../model/db"

// this file will contains all the functions of the prisma to connect to db and do operations. 
function createServiceError({error , status , message}){
    return new Error(`error -> ${error} with status -> ${status} and message is -> ${message}`)
}



async function findUser(email){
    const existingUser = await prisma.user.findUnique({
        where : {email}
    })
    return existingUser;
}

async function createUser(email, hashedPassword){
    const createUniqueUser = await prisma.user.create({
        data : {
            email,
            hashedPassword
        }
    })
    return createUniqueUser;
}

async function createToken(userId , refreshtoken , expiresAt){
    const storeToken = await prisma.refreshToken.create({
        data : {
            userId,
            token : refreshtoken,
            expiresAt
        }
    })
    return storeToken;
}

export {createServiceError , findUser , createUser , createToken}