import {
  createProfile,
  deleteProfile,
  findProfileByUserId,
  updateProfile,
} from "../repo/user.repo.js";
import AppError from "../utils/AppError.js";

async function getProfile(userId) {
  try {
    const profile = await findProfileByUserId(userId);

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    return profile;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("Internal server error", 500);
  }
}

async function createOrGetProfile(userId, email) {
  try {
    const existingProfile = await findProfileByUserId(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const defaultDisplayName = email ? email.split("@")[0] : null;
    const profile = await createProfile(userId, {
      displayName: defaultDisplayName,
    });

    return profile;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("Internal server error", 500);
  }
}

async function updateProfileByUserId(userId, data) {
  try {
    const existingProfile = await findProfileByUserId(userId);
    if (!existingProfile) {
      throw new AppError("Profile not found", 404);
    }

    const updatedProfile = await updateProfile(userId, data);
    return updatedProfile;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("Internal server error", 500);
  }
}

async function deleteProfileByUserId(userId) {
  try {
    const existingProfile = await findProfileByUserId(userId);
    if (!existingProfile) {
      throw new AppError("Profile not found", 404);
    }

    await deleteProfile(userId);
    return { message: "Profile deleted successfully" };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("Internal server error", 500);
  }
}

export {
  createOrGetProfile,
  deleteProfileByUserId as deleteProfile,
  getProfile,
  updateProfileByUserId as updateProfile,
};
