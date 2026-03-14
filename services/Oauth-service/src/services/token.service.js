import jwt from "jsonwebtoken";
import { createRefreshToken } from "../repos/oauth.repo.js";
import AppError from "../utils/AppError.js";

/**
 * @description creates token pair
 * @param {string} userId
 * @param {string} email
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
const generateTokenPair = async (userId, email) => {
  try {
    const accessToken = jwt.sign(
      {
        userId,
        email,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    const refreshToken = jwt.sign(
      {
        userId,
        email,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        algorithm: "HS256",
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
      },
    );
    const duration = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
    const msMap = {
      d: 86400000,
      h: 3600000,
      m: 60000,
      s: 1000,
    };
    const match = duration.match(/^(\d+)([dhms])$/i);
    if (!match) {
      throw new AppError("Invalid JWT_REFRESH_EXPIRES_IN format", 500);
    }
    const refreshExpiryMs =
      Number(match[1]) * msMap[match[2].toLowerCase()];
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    const saveRefreshToken = await createRefreshToken(
      userId,
      refreshToken,
      expiresAt,
    );
    if (!saveRefreshToken) {
      throw new AppError(
        "failed to save data in db , service unreachable",
        503,
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
};

/**
 * @description verifies and returns decoded payload
 * @param {string} token
 * @returns {payload : object}
 */
const verifyAccessToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!payload) {
      throw new AppError("failed to verify token", 300);
    }
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Invalid token", 401);
  }
};

const verifyRefreshToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    if (!payload) {
      throw new AppError("failed to verify token", 300);
    }
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Invalid refresh token", 401);
  }
};

export { generateTokenPair, verifyAccessToken, verifyRefreshToken };
