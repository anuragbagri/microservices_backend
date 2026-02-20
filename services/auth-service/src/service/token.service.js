import jwt from "jsonwebtoken";
import { createRefreshToken } from "../repo/auth.repo.js";
import AppError from "../utils/AppError.js";

/**
 * @description function to generate accesstoken and refresh token 
 * @param {string} Id 
 * @param {string} email 
 * @returns {Promise<{accessToken : string , refresh : string}> }
 */
async function generateTokenPair(Id , email){
    const accessToken = jwt.sign({
        Id,
        email
    },
    process.env.JWT_SECRET,
    {
        algorithm : "HS256",
        expiresIn : process.env.JWT_EXPIRES_IN
    });

   let refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

   const refreshToken = jwt.sign({
    Id,
    email
   },
   process.env.JWT_REFRESH_SECRET,
   {
     algorithm : "HS256",
     expiresIn : refreshTokenExpiresIn
   });


   // stores refreshtoken in db
   const storeRefreshToken = await createRefreshToken(Id , refreshToken ,refreshTokenExpiresIn); 

   return {
    accessToken,
    refreshToken
   }
}


/**
 * @description verify the token and payload
 * @param {string} token 
 * @returns {Promise<{payload : {
 * id : string,
 * email : string}}>} 
 */
async function verifyAccessToken(token){
    try {
       const jwtSecret = process.env.JWT_SECRET || "";
       const decodeToken = jwt.verify(token , jwtSecret , {
        algorithms : ["HS256"]
      });
      if(!decodeToken){
        throw new AppError("this token is invalid" , 401);
      }
      return decodeToken;
    }
     catch(err){
        throw new AppError("Invalid token" , 401);
    }
}

export {verifyAccessToken , generateTokenPair};

