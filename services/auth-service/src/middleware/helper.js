import AppError from "../utils/AppError.js";

export function errorHandler(){
    throw new AppError("request limit reached. try again after some time", 429);
}