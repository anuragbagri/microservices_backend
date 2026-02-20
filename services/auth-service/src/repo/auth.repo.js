import { prisma } from "../model/db.js";
// all db operations functions here
export async function findUserByEmail(email){
    const user = await prisma.user.findUnique({
        where : { email }
    });
    return user? user : null
}

export async function findUserById(id){
    const user = await prisma.user.findUnique({
        where : {
            id
        }
    })
    return user? user : null
}


export async function createUser(email , hashedPassword){
    const user = await prisma.user.create({
        data : {
            email ,
            hashedPassword
        }
    })
    return user;
} 

export async function createRefreshToken(userId , token , expiresAt){
    const refreshToken = await prisma.refreshToken.create({
        data : {
            userId,
            token,
            expiresAt
        }
    })
    return refreshToken;
}

export async function findRefreshToken(token){
    const findToken = await prisma.refreshToken.findUnique({
        where : {
            token
        }
    })
    return findToken? findToken : null;
}

export async function deleteToken(token){
    const deleteToken = await prisma.refreshToken.delete({
        where : {
            token
        }
    })
    return deleteToken; 
}

export async function deleteAllUserTokens(userId){
    const deleteUserCount = await prisma.refreshToken.deleteMany({
        where : {
            userId
        }
    })
    return deleteUserCount;
}
