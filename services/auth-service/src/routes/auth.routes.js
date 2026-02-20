import express from "express";
import {Router} from express;

import { loginLimiter , registerLimiter } from "../middleware/rateLimiter.js";

import authenticate  from "../middleware/authenticate.js";
import * as authController from "../controller/auth.controller.js";


const router = Router();

router.post("/register",registerLimiter , registerHandler);
router.post("/login" , loginLimiter , authController.loginUserHandler);
router.post("/refresh" , authController.refreshTokenHandler);
// router.post("/verify" , authController.verifyHandler);
router.post("/logout" ,authenticate,  authController.logOutHandler);
router.post("me" ,authenticate,  authController.getMeHandler)


export default authRoutes = router;   