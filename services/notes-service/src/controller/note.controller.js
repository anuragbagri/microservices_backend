import AppError from "../utils/AppError.js";
import {
  addTag,
  createNote,
  deleteNote,
  getNote,
  listNotes,
  removeTag,
  updateNote,
} from "../service/note.service.js";
import { ApiSuccessResponse } from "../utils/ApiResponse.js";

function sanitizeNoteBody(body) {
  const allowedFields = ["title", "content", "isPinned", "isArchived"];

  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined),
  );
}

async function listNotesHandler(req, res) {
  try {
    const userId = req.user.id;
    const filters = {
      ...(req.query.isPinned !== undefined && { isPinned: req.query.isPinned === "true" }),
      ...(req.query.isArchived !== undefined && { isArchived: req.query.isArchived === "true" }),
      ...(req.query.tagId !== undefined && { tagId: req.query.tagId }),
    };

    const notes = await listNotes(userId, filters);
    return res.status(200).json(new ApiSuccessResponse("success", 200, notes));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getNoteHandler(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await getNote(noteId, userId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, note));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function createNoteHandler(req, res) {
  try {
    const userId = req.user.id;
    const payload = sanitizeNoteBody(req.body || {});
    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    if (!title) {
      throw new AppError("title is required", 400);
    }
    payload.title = title;

    const note = await createNote(userId, payload);
    return res.status(201).json(new ApiSuccessResponse("success", 201, note));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function updateNoteHandler(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const payload = sanitizeNoteBody(req.body || {});

    const note = await updateNote(noteId, userId, payload);
    return res.status(200).json(new ApiSuccessResponse("success", 200, note));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function deleteNoteHandler(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const deleted = await deleteNote(noteId, userId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, deleted));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function addTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { tagId } = req.body || {};

    if (!tagId) {
      throw new AppError("tagId is required", 400);
    }

    const result = await addTag(noteId, userId, tagId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, result));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function removeTagHandler(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const tagId = req.params.tagId;

    const result = await removeTag(noteId, userId, tagId);
    return res.status(200).json(new ApiSuccessResponse("success", 200, result));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export {
  addTagHandler,
  createNoteHandler,
  deleteNoteHandler,
  getNoteHandler,
  listNotesHandler,
  removeTagHandler,
  updateNoteHandler,
};
