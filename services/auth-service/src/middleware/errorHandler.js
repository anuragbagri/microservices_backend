import { ApiErrorResponse } from "../utils/ApiResponse.js";

export async function errorHandler(err, req, res, next){
      // this milldeware should be registered last after all routes
      const statusCode = err.statusCode || 400;
      const msg = err.message || "something went wrong";
      //operational error 
      
      if(err.isOperational){
        return res.status(statusCode).json( new ApiErrorResponse(msg , statusCode))
      }
      
      // unknown error 
      return res.status(500).json(new ApiErrorResponse("Internal server error" , 500))
}

