import prisma from "../model/db.js";

/**
 * @description utility functions to do crud in db
 * @param {string}
 * @returns { <Promise{object}>}
 */

async function findOAuthUserByProvider(provider, providerUserId) {
  const findUser = await prisma.oAuthUser.findUnique({
    where: {
      provider_providerUserId: {
        provider: provider,
        providerUserId: providerUserId,
      },
    },
  });
  return findUser;
}

async function findOAuthUserById(id) {
  const findUser = await prisma.oAuthUser.findUnique({
    where: {
      id,
    },
  });
  return findUser;
}

async function upsertOAuthUser(data) {
  const user = await prisma.oAuthUser.upsert({
    where: {
      provider_providerUserId: {
        provider: data.provider,
        providerUserId: data.providerUserId,
      },
    },
    update: {
      name: data.name,
      avatarUrl: data.avatarUrl,
    },
    create: {
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      provider: data.provider,
      providerUserId: data.providerUserId,
    },
  });
  return user;
}

async function createOAuthToken(
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt,
) {
  const createUser = await prisma.oAuthToken.create({
    data: {
      userId: userId,
      provider: provider,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    },
  });
  return createUser;
}

async function findOAuthTokenByUserIdAndProvider(userId, provider) {
  const token = await prisma.oAuthToken.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  });
  return token;
}

async function updateOAuthToken(
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt,
) {
  const updateToken = await prisma.oAuthToken.updateMany({
    where: {
      userId,
      provider,
    },
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    },
  });
  return updateToken;
}

async function upsertOAuthToken(
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt,
) {
  const token = await prisma.oAuthToken.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken,
      refreshToken,
      expiresAt,
    },
    create: {
      userId,
      provider,
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
  return token;
}

async function createRefreshToken(userId, token, expiresAt) {
  const createRefreshToken = await prisma.oAuthRefreshToken.create({
    data: {
      userId: userId,
      token: token,
      expiresAt: expiresAt,
    },
  });
  return createRefreshToken;
}

async function findRefreshToken(token) {
  const findRefreshToken = await prisma.oAuthRefreshToken.findUnique({
    where: {
      token,
    },
  });
  return findRefreshToken;
}

async function deleteRefreshToken(token) {
  const deleteToken = await prisma.oAuthRefreshToken.delete({
    where: {
      token,
    },
  });
  return deleteToken;
}

async function deleteALLUserRefreshTokens(userId) {
  // logout from all devices
  const deleteFromAllDevices = await prisma.oAuthRefreshToken.deleteMany({
    where: {
      userId,
    },
  });
  return deleteFromAllDevices;
}

export {
  findOAuthUserById,
  findOAuthUserByProvider,
  findOAuthTokenByUserIdAndProvider,
  upsertOAuthUser,
  createOAuthToken,
  updateOAuthToken,
  upsertOAuthToken,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteALLUserRefreshTokens,
};
