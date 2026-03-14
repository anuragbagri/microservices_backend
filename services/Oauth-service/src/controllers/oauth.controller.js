import crypto from "crypto";
import { buildGoogleAuthUrl } from "../services/oauth.service";
import AppError from "../utils/AppError";
import { handleGoogleCallback } from "../services/helper.service";

function googleRedirectHandler(req, res) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    const redirectGoogleUrl = buildGoogleAuthUrl(state);
    res.redirect(redirectGoogleUrl);
  } catch (err) {
    throw new AppError("Internal server error", 500);
  }
}

function googleCallBackHandler(req, res) {
  try {
    if (req.query.state === req.session.oauthState) {
      req.session.oauthState = "";
      const code = req.query.code;
      const handleGoogle = handleGoogleCallback(code);
      return handleGoogle.access_token;
    }
  } catch (err) {
    throw new AppError("Internal server error", 500);
  }
}
