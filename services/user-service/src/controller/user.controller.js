import {
  createOrGetProfile,
  deleteProfile,
  getProfile,
  updateProfile,
} from "../service/user.service.js";
import { ApiSuccessResponse } from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

function sanitizeUpdateBody(body) {
  const allowedFields = [
    "username",
    "displayName",
    "bio",
    "avatarUrl",
    "phoneNumber",
    "dateOfBirth",
  ];

  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined),
  );
}

async function getMeHandler(req, res) {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    const profile = await createOrGetProfile(userId, email);
    return res.status(200).json(new ApiSuccessResponse("success", 200, profile));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function updateMeHandler(req, res) {
  try {
    const userId = req.user.id;
    const payload = sanitizeUpdateBody(req.body || {});

    if (Object.keys(payload).length === 0) {
      throw new AppError("No valid profile fields provided", 400);
    }

    const updatedProfile = await updateProfile(userId, payload);
    return res.status(200).json(new ApiSuccessResponse("success", 200, updatedProfile));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function deleteMeHandler(req, res) {
  try {
    const userId = req.user.id;
    const deleted = await deleteProfile(userId);

    return res.status(200).json(new ApiSuccessResponse("success", 200, deleted));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getPublicProfileHandler(req, res) {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError("User id is required", 400);
    }

    const profile = await getProfile(userId);

    const publicProfile = {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    return res.status(200).json(new ApiSuccessResponse("success", 200, publicProfile));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export { deleteMeHandler, getMeHandler, getPublicProfileHandler, updateMeHandler };
