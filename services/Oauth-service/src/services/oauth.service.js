import axios from "axios";
import AppError from "../utils/AppError.js";

const buildGoogleAuthUrl = (state) => {
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const authUrlParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  }).toString();

  return `${baseUrl}?${authUrlParams}`;
};

const buildGithubAuthUrl = (state) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const authUrlParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
    state,
  }).toString();
  return `${baseUrl}?${authUrlParams}`;
};

const exchangeGoogleCode = async (code) => {
  try {
    const makeCall = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!makeCall.data) {
      throw new AppError("Failed to connect to Google token endpoint", 429);
    }

    return {
      accessToken: makeCall.data.access_token,
      refreshToken: makeCall.data.refresh_token ?? null,
      expiresIn: makeCall.data.expires_in ?? null,
      tokenType: makeCall.data.token_type,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
};

const exchangeGithubCode = async (code) => {
  try {
    const makeCall = await axios.post(
      "https://github.com/login/oauth/access_token",
      new URLSearchParams({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!makeCall.data) {
      throw new AppError("Failed to connect to GitHub token endpoint", 429);
    }

    return {
      accessToken: makeCall.data.access_token,
      refreshToken: makeCall.data.refresh_token ?? null,
      expiresIn: makeCall.data.expires_in ?? null,
      tokenType: makeCall.data.token_type,
      scope: makeCall.data.scope,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
};

const getGoogleUserInfo = async (accessToken) => {
  try {
    const makeCall = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!makeCall.data) {
      throw new AppError("Failed to get user data from Google", 429);
    }
    return {
      sub: makeCall.data.sub,
      email: makeCall.data.email,
      name: makeCall.data.name,
      picture: makeCall.data.picture,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
};

const getGithubUserInfo = async (accessToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };
    const userResponse = await axios.get("https://api.github.com/user", { headers });

    let { id, email, name, avatar_url } = userResponse.data;
    if (!email) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", { headers });
      const primaryEmail = emailResponse.data.find(
        (item) => item.primary === true && item.verified === true,
      );
      if (primaryEmail) {
        email = primaryEmail.email;
      }
    }

    return {
      id: id.toString(),
      email,
      name,
      picture: avatar_url,
    };
  } catch (err) {
    throw new AppError("Failed to fetch GitHub user info", 500);
  }
};

export {
  buildGoogleAuthUrl,
  buildGithubAuthUrl,
  exchangeGoogleCode,
  exchangeGithubCode,
  getGoogleUserInfo,
  getGithubUserInfo,
};
