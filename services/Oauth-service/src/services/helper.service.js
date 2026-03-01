import { findRefreshToken } from "../../../auth-service/src/repo/auth.repo";
import {
  createOAuthToken,
  deleteRefreshToken,
  deleteRefreshToken,
  findOAuthUserById,
  findOAuthUserByProvider,
  findRefreshToken,
  updateOAuthToken,
  upsertOAuthUser,
} from "../repos/oauth.repo";
import AppError from "../utils/AppError";
import {
  exchangeGithubCode,
  exchangeGoogleCode,
  getGithubUserInfo,
  getGoogleUserInfo,
} from "./oauth.service";
import { generateTokenPair, verifyRefreshToken } from "./token.service";

/**
 * @description exchanges code for access_token
 * @param {string} code
 * @returns {object}
 */

async function handleGoogleCallback(code) {
  try {
    const { accessToken, refreshToken, expiresIn } =
      await exchangeGoogleCode(code);

    if (!accessToken) {
      throw new AppError("Failed to get access token from Google", 400);
    }

    const { sub, email, name, picture } = await getGoogleUserInfo(accessToken);

    if (!sub || !email) {
      throw new AppError("Invalid Google user data", 400);
    }

    //upsert oauthuser
    const user = await upsertOAuthUser({
      email,
      name,
      avatarUrl: picture,
      provider: "google",
      providerUserId: sub,
    });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const doesOAuthTokenExistsForProvider = await findOAuthUserByProvider(
      "google",
      user.id,
    );
    if (doesOAuthTokenExistsForProvider) {
      await updateOAuthToken(
        user.id,
        "google",
        accessToken,
        refreshToken,
        expiresAt,
      );
    } else {
      await createOAuthToken(
        user.id,
        "google",
        accessToken,
        refreshToken,
        expiresAt,
      );
    }
    const { access_token, refresh_token } = await generateTokenPair(
      user.id,
      email,
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Google authentication failed", 500);
  }
}

async function handleGithubCallback(code) {
  try {
    const { accessToken, refreshToken, expiresIn } =
      await exchangeGithubCode(code);
    if (!accessToken) {
      throw new AppError("failed to get access token from github", 400);
    }

    const { id, email, name, picture } = await getGithubUserInfo(accessToken);

    if (!id || !email) {
      throw new AppError("Invalid github user", 400);
    }

    // upsert oauth user
    const user = await upsertOAuthUser({
      email: email,
      name: name,
      avatarUrl: picture,
      provider: "github",
      providerUserId: String(id),
    });
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const doesOAuthTokenExistsForProvider = await findOAuthUserByProvider(
      "github",
      user.id,
    );
    if (doesOAuthTokenExistsForProvider) {
      await updateOAuthToken(
        user.id,
        "github",
        accessToken,
        refreshToken,
        expiresAt,
      );
    } else {
      await createOAuthToken(
        user.id,
        "github",
        accessToken,
        refreshToken,
        expiresAt,
      );
    }
    const { access_token, refresh_token } = await generateTokenPair(
      user.id,
      email,
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Google authentication failed", 500);
  }
}

/**
 * @description utility functions for routes
 * @param {string} refreshToken
 * @returns {object}
 */
async function refreshUserToken(refreshToken) {
  try {
    const doesTokenExistInDb = await findRefreshToken(refreshToken);
    if (!doesTokenExistInDb) {
      throw new AppError("token does not exist in db", 400);
    }

    // token expired
    if (doesTokenExistInDb.expiresAt < new Date()) {
      throw new AppError("refresh token expired", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    deleteRefreshToken(refreshToken);
    const { access_token, refresh_token } = await generateTokenPair(
      payload.userId,
      payload.email,
    );

    return {
      access_token,
      refresh_token,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function logoutUser(refreshToken) {
  try {
    const findRefreshToken = await findRefreshToken(refreshToken);
    if (!findRefreshToken) {
      throw new AppError("token does not exist", 400);
    }
    const deleteRefresh = await deleteRefreshToken(refreshToken);
    return {
      message: "logged out successfully",
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getMe(userId) {
  try {
    const findUserById = await findOAuthUserById(userId);
    if (!findUserById) {
      throw new AppError("user not found", 400);
    }
    const { id, email, name, avatarUrl, provider } = findOAuthUserById;
    return {
      id,
      email,
      name,
      avatarUrl,
      provider,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export {
  handleGoogleCallback,
  handleGithubCallback,
  refreshUserToken,
  logoutUser,
  getMe,
};
