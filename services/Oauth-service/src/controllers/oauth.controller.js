import crypto from "crypto";
import {
  buildGithubAuthUrl,
  buildGoogleAuthUrl,
} from "../services/oauth.service.js";
import {
  getMe,
  handleGithubCallback,
  handleGoogleCallback,
  logoutUser,
  refreshUserToken,
} from "../services/helper.service.js";
import { verifyAccessToken } from "../services/token.service.js";
import AppError from "../utils/AppError.js";

function googleRedirectHandler(req, res, next) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    const redirectGoogleUrl = buildGoogleAuthUrl(state);
    return res.redirect(redirectGoogleUrl);
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

async function googleCallBackHandler(req, res, next) {
  try {
    const queryState = req.query.state;
    const sessionState = req.session.oauthState;
    if (!queryState || !sessionState || queryState !== sessionState) {
      throw new AppError("Invalid OAuth state", 400);
    }

    req.session.oauthState = "";
    const code = req.query.code;
    if (!code) {
      throw new AppError("Authorization code missing", 400);
    }

    const handleGoogle = await handleGoogleCallback(code);
    return res.status(200).json({
      success: true,
      data: handleGoogle,
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

function githubRedirectHandler(req, res, next) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    const redirectGithubUrl = buildGithubAuthUrl(state);
    return res.redirect(redirectGithubUrl);
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

async function githubCallBackHandler(req, res, next) {
  try {
    const queryState = req.query.state;
    const sessionState = req.session.oauthState;
    if (!queryState || !sessionState || queryState !== sessionState) {
      throw new AppError("Invalid OAuth state", 400);
    }

    req.session.oauthState = "";
    const code = req.query.code;
    if (!code) {
      throw new AppError("Authorization code missing", 400);
    }

    const handleGithub = await handleGithubCallback(code);
    return res.status(200).json({
      success: true,
      data: handleGithub,
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

async function refreshTokenHandler(req, res, next) {
  try {
    const tokenData = req.headers.authorization;
    const token = tokenData?.split(" ")[1];
    if (!tokenData || !tokenData.startsWith("Bearer") || !token) {
      throw new AppError("Please authenticate", 401);
    }

    const refreshedTokens = await refreshUserToken(token);
    return res.status(200).json({
      success: true,
      data: refreshedTokens,
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

async function logOutHandler(req, res, next) {
  try {
    const tokenData = req.headers.authorization;
    const token = tokenData?.split(" ")[1];
    if (!tokenData || !tokenData.startsWith("Bearer") || !token) {
      throw new AppError("Please authenticate", 401);
    }

    const loggedOut = await logoutUser(token);
    return res.status(200).json({
      success: true,
      data: loggedOut,
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

async function getMeHandler(req, res, next) {
  try {
    const tokenData = req.headers.authorization;
    const token = tokenData?.split(" ")[1];
    if (!tokenData || !tokenData.startsWith("Bearer") || !token) {
      throw new AppError("Please authenticate", 401);
    }

    const payload = verifyAccessToken(token);
    const user = await getMe(payload.userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
}

export {
  getMeHandler,
  githubCallBackHandler,
  githubRedirectHandler,
  googleCallBackHandler,
  googleRedirectHandler,
  logOutHandler,
  refreshTokenHandler,
};
