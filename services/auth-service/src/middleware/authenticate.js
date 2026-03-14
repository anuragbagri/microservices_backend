import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

async function authenticate(req, res, next){
    try {
        const tokenData = req.headers.authorization;
        if(!tokenData || !tokenData.startsWith("Bearer")){
            throw new AppError("Invalid Credentails" , 401);
        }
        const jwtSecret = process.env.JWT_SECRET || "";
        const token = tokenData.split(" ")[1];
        const verifyToken = jwt.verify(token , jwtSecret , {
            algorithms : ["HS256"]
        });
        req.user = {id : verifyToken.id , email : verifyToken.email}
        next()
    }
    catch(err){
        next(err instanceof AppError ? err : new AppError("Internal server Error" , 500));
    }
}

export default authenticate;
