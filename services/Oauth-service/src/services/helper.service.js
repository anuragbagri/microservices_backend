import {
  createOAuthToken,
  findOAuthUserByProvider,
  updateOAuthToken,
  upsertOAuthUser,
} from "../repos/oauth.repo";
import AppError from "../utils/AppError";
import { exchangeGoogleCode, getGoogleUserInfo } from "./oauth.service";
import { generateTokenPair } from "./token.service";

/**
 *
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
      accessToken,
      refreshToken,
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

async function handleGithubCallback(code) {}

function refreshUserToken(refreshToken) {}

function logoutUser(refreshToken) {}

function getMe(userId) {}

export {
  handleGoogleCallback,
  handleGithubCallback,
  refreshUserToken,
  logoutUser,
  getMe,
};
