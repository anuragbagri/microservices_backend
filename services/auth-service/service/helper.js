import jwt from "jsonwebtoken";
import { createToken } from "../repo/helper";

async function generateToken({id , email}){
    const payload = {id , email};
    const accesstokenOptions = proces.env.JWT_EXPIRES_IN || "";
    const accessToken = jwt.sign(payload , process.env.JWT_SECRET , accesstokenOptions);
    const refreshTokenOptions = process.env.JWT_REFRESH_EXPIRES_IN || "";
    const refreshToken = jwt.sign(payload , process.env.JWT_REFRESH_SECRET , refreshTokenOptions);

    // store refresh token in the database... 
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 7);
    
    const storeToken = await createToken(payload.id , payload.email , expiresIn)
}

export {generateToken}; 