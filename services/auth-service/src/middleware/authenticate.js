import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

async function Authenticate(req, res, next){
    try {
        const tokenData = req.headers.authorization;
        if(!tokenData || !tokenData.startsWith("Bearer")){
            throw new AppError("Invalid Credentails" , 401);
        }
        const jwtSecret = process.env.JWT_SECRET || "";
        const token = tokenData.split(" ")[1];
        const verifyToken = jwt.verify(token , jwtSecret);
        if(!verifyToken){
            throw new AppError("Invalid token or expired" , 401);
        }
        req.user = {id : verifyToken.Id , email : verifyToken.email}
        next()
    }
    catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server Error" , 500);
    }
}