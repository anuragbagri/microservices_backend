import prisma from "../model/db";
import { createServiceError, createUser, findUser } from "../repo/helper";
import { generateToken } from "./helper";

async function authService(){
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; 
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN
    const bcryptRounds = process.env.BCRYPT_ROUNDS; 

    if(!jwtSecret || !jwtRefreshSecret){
        throw new Error("jwt secrets are not defined in environment variables");
    }
} 

const userToken = async function register(email , password){
    const existingUser = await findUser(email);
    if(existingUser){
        throw createServiceError("error" , 401, "user already exist");
    }
    const createUniqueUser = createUser(email , hashedPassword);
    return generateToken({id : createUniqueUser.id ,email : createUniqueUser.email});
}