import {
  createTag as createTagRepo,
  deleteTag as deleteTagRepo,
  findTagById,
  findTagsByIds,
  findTagsByUserId,
  updateTag as updateTagRepo,
} from "../repo/tag.repo.js";
import AppError from "../utils/AppError.js";

function isPrismaKnownRequestError(err) {
  return (
    err &&
    typeof err === "object" &&
    typeof err.code === "string" &&
    /^P\d{4}$/.test(err.code)
  );
}

async function listTags(userId) {
  try {
    return findTagsByUserId(userId);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getTag(tagId, userId) {
  try {
    const tag = await findTagById(tagId);
    if (!tag) {
      throw new AppError("Tag not found", 404);
    }
    if (tag.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }
    return tag;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function createTag(userId, data) {
  try {
    return await createTagRepo(userId, data);
  } catch (err) {
    if (isPrismaKnownRequestError(err) && err.code === "P2002") {
      throw new AppError("Tag name already exists", 409);
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function updateTag(tagId, userId, data) {
  try {
    const existing = await findTagById(tagId);
    if (!existing) {
      throw new AppError("Tag not found", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }
    return await updateTagRepo(tagId, data);
  } catch (err) {
    if (isPrismaKnownRequestError(err) && err.code === "P2002") {
      throw new AppError("Tag name already exists", 409);
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function deleteTag(tagId, userId) {
  try {
    const existing = await findTagById(tagId);
    if (!existing) {
      throw new AppError("Tag not found", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }
    return await deleteTagRepo(tagId);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getTagsByIds(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    const tags = await findTagsByIds(ids);
    const byId = new Map(tags.map((t) => [t.id, t]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export {
  createTag,
  deleteTag,
  getTag,
  getTagsByIds,
  listTags,
  updateTag,
};
