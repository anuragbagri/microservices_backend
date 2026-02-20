import { createUser, deleteToken, findRefreshToken, findUserByEmail, findUserById } from "../repo/auth.repo.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import { generateTokenPair } from "./token.service.js";
import jwt from "jsonwebtoken";

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{accessToken : string , refreshToken : string , user : {
 * id : string,
 * email : string
 * }}>}
 */


const registerUser = async(email , password) => {
    try {
    const user = await findUserByEmail(email);

    if(user){
        throw new AppError("user already exists", 409);
    }

    const hashPassword = await bcrypt.hash(password ,Number( process.env.BCRYPT_ROUNDS));
    const newUser = await createUser(email , hashPassword);
    const generateToken = await generateTokenPair(newUser.id, email);

    return {
        accessToken : generateToken.accessToken,
        refreshToken : generateToken.refreshToken,
        user : {
            id : newUser.id,
            email : email
        }
    }
    }catch(err){
        // throw prev error if user exists
        if(err instanceof AppError){
            throw err
        }

        throw new AppError("Internal server error" , 500);
    }
}


/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
const login = async(email , password) => {
    try { 
        const findUser = await findUserByEmail(email);
        if(!findUser){
            throw new AppError("Invalid credentials", 401);
        }
        const comparePassword = await bcrypt.compare(password, findUser.password);
        if(!comparePassword){
            throw new AppError("Invalid credentials" , 401);
        }
        const generateToken = await generateTokenPair(findUser.id , email);

        return {
            accessToken : generateToken.accessToken,
            refreshToken : generateToken.refreshToken,
            user : {
                id : findUser.id,
                email : findUser.email
            }
        }
    }
    catch(err){
        if(err instanceof AppError){
            throw err;
        }

        throw new AppError("Internal server Error" , 500);
    }
}


/**
 * 
 * @param {string} refreshToken 
 * @returns {Promise<{accessToken : string , refreshToken : string}>}
 */
const refresh = async(refreshToken) => {
    try {
        const RefreshToken = await findRefreshToken(refreshToken);
        if(!findRefreshToken){
            throw new AppError("Invalid refresh token", 401);
        }

        if(RefreshToken.expiresAt > new Date()){
            throw new AppError("Refresh token exipred" , 401);
        }
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "";
        const payload = jwt.verify(refreshToken, refreshTokenSecret);
        const deleteOldRefreshToken = await deleteToken(refreshToken);
        const newTokenPair = await generateTokenPair(payload.Id, payload.email);

        return {
            accessToken : newTokenPair.accessToken,
            refreshToken : newTokenPair.refreshToken
        }
    }
    catch(err){
        if(err instanceof AppError){
            throw err;
        }
        throw new AppError("Internal Server Error" , 500);
    }
}


/**
 * 
 * @param {string} refreshToken 
 * @returns 
 */
const logOut = async(refreshToken) => {
      try {
         const getRefreshToken = await findRefreshToken(refreshToken);
         if(!refreshToken){
            throw new AppError("Token not Found" , 404);
         }
         const deleteRefreshToken = await deleteToken(refreshToken);

         return {
            message : "Logged out successfully"
         }
      }catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server Error" , 500);
      }
}


/**
 * 
 * @param {string} userId 
 * @returns {Promise<{user : object}}
 */
const getMe = async(userId) => {
    try {
        const getUserFromDb = await findUserById(userId);
        if(!getUserFromDb){
            throw new AppError("User not found" , 404);
        }
        return {
            id : getUserFromDb.id,
            email : getUserFromDb.email,
            createdAt : getUserFromDb.createdAt
        }
    }
    catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server Error" , 500);
    }
}


export { registerUser , login , refresh ,getMe , logOut }

