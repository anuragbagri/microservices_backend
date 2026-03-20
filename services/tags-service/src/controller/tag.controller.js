import {
  createTag,
  deleteTag,
  getTag,
  getTagsByIds,
  listTags,
  updateTag,
} from "../service/tag.service.js";
import { ApiSuccessResponse } from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeCreateBody(body) {
  const allowedFields = ["name", "color"];
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key, value]) => allowedFields.includes(key) && value !== undefined),
  );
}

function sanitizeUpdateBody(body) {
  const allowedFields = ["name", "color"];
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key, value]) => allowedFields.includes(key) && value !== undefined),
  );
}

async function listTagsHandler(req, res) {
  try {
    const userId = req.user.id;
    const tags = await listTags(userId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, tags));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const tagId = req.params.id;
    const tag = await getTag(tagId, userId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, tag));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function createTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const payload = sanitizeCreateBody(req.body || {});
    const name = typeof payload.name === "string" ? payload.name.trim() : "";

    if (!name) {
      throw new AppError("name is required", 400);
    }
    payload.name = name;

    if (payload.color !== undefined && payload.color !== null) {
      if (typeof payload.color !== "string" || !HEX_COLOR_REGEX.test(payload.color.trim())) {
        throw new AppError("color must be a valid hex color", 400);
      }
      payload.color = payload.color.trim();
    }

    const tag = await createTag(userId, payload);
    return res.status(201).json(new ApiSuccessResponse("success", 201, tag));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function updateTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const tagId = req.params.id;
    const payload = sanitizeUpdateBody(req.body || {});

    if (payload.name !== undefined) {
      const trimmed = typeof payload.name === "string" ? payload.name.trim() : "";
      if (!trimmed) {
        throw new AppError("name cannot be empty", 400);
      }
      payload.name = trimmed;
    }

    if (payload.color !== undefined && payload.color !== null) {
      if (typeof payload.color !== "string" || !HEX_COLOR_REGEX.test(payload.color.trim())) {
        throw new AppError("color must be a valid hex color", 400);
      }
      payload.color = payload.color.trim();
    }

    if (Object.keys(payload).length === 0) {
      throw new AppError("No valid tag fields provided", 400);
    }

    const tag = await updateTag(tagId, userId, payload);
    return res.status(200).json(new ApiSuccessResponse("success", 200, tag));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function deleteTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const tagId = req.params.id;
    const deleted = await deleteTag(tagId, userId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, deleted));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getTagsByIdsHandler(req, res) {
  try {
    const rawIds = req.body?.ids;
    if (!Array.isArray(rawIds)) {
      throw new AppError("ids must be an array", 400);
    }
    const ids = rawIds.filter((id) => typeof id === "string");
    const tags = await getTagsByIds(ids);
    return res.status(200).json(new ApiSuccessResponse("success", 200, tags));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export {
  createTagHandler,
  deleteTagHandler,
  getTagHandler,
  getTagsByIdsHandler,
  listTagsHandler,
  updateTagHandler,
};
