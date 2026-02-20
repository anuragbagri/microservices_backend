import { getMe, logOut, refresh, registerUser } from "../service/helper.service.js";
import { login } from "../service/helper.service.js";
import { ApiSuccessResponse } from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

/**
 * @description these handlers connect to service layer functions for business logic 
 * @param {object} req 
 * @param {object} res 
 * @returns  { res : object }
 */


async function registerHandler(req , res){
    try {
    const { email , password } = req.body;

    //some kind of validation on the email and password.
    const signUpUser = await registerUser(email , password);
    if(!signUpUser){
        throw new AppError("Internal server Error" , 500);
    }
    return res.status(200).json(new ApiSuccessResponse("success" , 200 , signUpUser))
    }
    catch(err){
      if(err instanceof AppError){
        throw err
      }
      throw new AppError("Internal server Error" , 500);
    }
}



async function loginUserHandler(req, res){
    try {
    const {email , password } = req.body;
    const checkUser = await login(email , password);
    if(!checkUser){
        throw new AppError("Invalid Credentials" , 400);
    }
    return res.status(200).json(new ApiSuccessResponse("success" , 200 , checkUser))
    }
    catch(err){
        if(err instanceof AppError){
            throw err 
        }

        throw new AppError("Internal server Error",500);
    }
}

async function refreshTokenHandler(req, res){
    try  {
        const tokenData = req.headers.authorization;
        if(!token || !token.startsWith("Bearer")){
            throw new AppError("Please authenticate", 401);
        }
        const token = tokenData.split(" ")[1];
        const getNewToken = await refresh(token);
        return res.status(200).json(new ApiSuccessResponse("success" , 200 ,getNewToken));
    }
    catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server error" , 500);
    }
}


// let not consider this route as of now 
// async function verify()


async function logOutHandler(req, res){
    try  {
        const tokenData = req.headers.authorization;
        if(!token || !token.startsWith("Bearer")){
            throw new AppError("Please authenticate", 401);
        }
        const token = tokenData.split(" ")[1];
        const getNewToken = await logOut(token);
        return res.status(200).json( new ApiSuccessResponse("success" , 200 , getNewToken))
    }
    catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server error" , 500);
    }
}

async function getMeHandler(req, res){
    try {
        const userId = req.user.id;
        const getUserFromDb = await getMe(userId);
        if(!get){
            throw new AppError("no user with this id ", 500);
        }

        return res.status(200).json(new ApiSuccessResponse("success" , 200 , getUserFromDb));
    }
    catch(err){
        if(err instanceof AppError){
            throw err
        }
        throw new AppError("Internal server error" , 500);
    }
}

export { getMeHandler , logOutHandler , registerHandler , loginUserHandler , refreshTokenHandler }

