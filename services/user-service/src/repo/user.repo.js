import { prisma } from "../model/db.js";

async function findProfileByUserId(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: {
      userId,
    },
  });

  return profile || null;
}

async function createProfile(userId, data = {}) {
  const profile = await prisma.userProfile.create({
    data: {
      userId,
      ...data,
    },
  });

  return profile;
}

async function updateProfile(userId, data) {
  const profile = await prisma.userProfile.update({
    where: {
      userId,
    },
    data,
  });

  return profile;
}

async function deleteProfile(userId) {
  const deletedProfile = await prisma.userProfile.delete({
    where: {
      userId,
    },
  });

  return deletedProfile;
}

export { createProfile, deleteProfile, findProfileByUserId, updateProfile };
