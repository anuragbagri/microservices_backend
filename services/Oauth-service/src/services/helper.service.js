import {
  deleteRefreshToken,
  findOAuthUserById,
  findRefreshToken,
  upsertOAuthToken,
  upsertOAuthUser,
} from "../repos/oauth.repo.js";
import AppError from "../utils/AppError.js";
import {
  exchangeGithubCode,
  exchangeGoogleCode,
  getGithubUserInfo,
  getGoogleUserInfo,
} from "./oauth.service.js";
import { generateTokenPair, verifyRefreshToken } from "./token.service.js";

async function handleGoogleCallback(code) {
  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeGoogleCode(code);

    if (!accessToken) {
      throw new AppError("Failed to get access token from Google", 400);
    }

    const { sub, email, name, picture } = await getGoogleUserInfo(accessToken);
    if (!sub || !email) {
      throw new AppError("Invalid Google user data", 400);
    }

    const user = await upsertOAuthUser({
      email,
      name,
      avatarUrl: picture,
      provider: "google",
      providerUserId: sub,
    });

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    await upsertOAuthToken(
      user.id,
      "google",
      accessToken,
      refreshToken,
      expiresAt,
    );

    const { accessToken: appAccessToken, refreshToken: appRefreshToken } =
      await generateTokenPair(user.id, email);

    return {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
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
    const { accessToken, refreshToken, expiresIn } = await exchangeGithubCode(code);
    if (!accessToken) {
      throw new AppError("Failed to get access token from github", 400);
    }

    const { id, email, name, picture } = await getGithubUserInfo(accessToken);
    if (!id || !email) {
      throw new AppError("Invalid github user", 400);
    }

    const user = await upsertOAuthUser({
      email,
      name,
      avatarUrl: picture,
      provider: "github",
      providerUserId: String(id),
    });

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    await upsertOAuthToken(
      user.id,
      "github",
      accessToken,
      refreshToken,
      expiresAt,
    );

    const { accessToken: appAccessToken, refreshToken: appRefreshToken } =
      await generateTokenPair(user.id, email);

    return {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
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
    throw new AppError("Github authentication failed", 500);
  }
}

async function refreshUserToken(refreshToken) {
  try {
    const doesTokenExistInDb = await findRefreshToken(refreshToken);
    if (!doesTokenExistInDb) {
      throw new AppError("Token does not exist in db", 400);
    }

    if (doesTokenExistInDb.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await findOAuthUserById(payload.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await deleteRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      payload.userId,
      user.email,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
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
    const existingRefreshToken = await findRefreshToken(refreshToken);
    if (!existingRefreshToken) {
      throw new AppError("Token does not exist", 400);
    }
    await deleteRefreshToken(refreshToken);
    return {
      message: "Logged out successfully",
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
      throw new AppError("User not found", 400);
    }
    const { id, email, name, avatarUrl, provider } = findUserById;
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
