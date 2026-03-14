import { Router } from "express";
import * as oauthController from "../controllers/oauth.controller.js";

const router = Router();

router.get("/google", oauthController.googleRedirectHandler);
router.get("/google/callback", oauthController.googleCallBackHandler);
router.get("/github", oauthController.githubRedirectHandler);
router.get("/github/callback", oauthController.githubCallBackHandler);

router.post("/refresh", oauthController.refreshTokenHandler);
router.post("/logout", oauthController.logOutHandler);
router.get("/me", oauthController.getMeHandler);

export default router;
