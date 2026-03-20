import axios from "axios";
import AppError from "../utils/AppError.js";
import {
  addTagToNote,
  createNote as createNoteRepo,
  deleteNote as deleteNoteRepo,
  findNoteById,
  findNotesByUserId,
  getTagsForNote,
  getTagsForNotes,
  removeTagFromNote,
  updateNote as updateNoteRepo,
} from "../repo/note.repo.js";

const TAGS_SERVICE_URL = process.env.TAGS_SERVICE_URL || "http://localhost:6105";

function isPrismaKnownRequestError(err) {
  return (
    err &&
    typeof err === "object" &&
    typeof err.code === "string" &&
    /^P\d{4}$/.test(err.code)
  );
}

function mapPrismaError(err, operation) {
  if (!isPrismaKnownRequestError(err)) {
    return null;
  }

  if (operation === "createNote") {
    if (err.code === "P2002") {
      return new AppError("Note already exists", 409);
    }
    if (err.code === "P2011" || err.code === "P2000" || err.code === "P2003") {
      return new AppError("Invalid note payload", 400);
    }
  }

  if (operation === "addTag") {
    if (err.code === "P2002") {
      return new AppError("Tag already added to note", 409);
    }
    if (err.code === "P2003" || err.code === "P2025") {
      return new AppError("Tag not found", 404);
    }
    if (err.code === "P2011" || err.code === "P2000") {
      return new AppError("Invalid tag payload", 400);
    }
  }

  if (operation === "removeTag") {
    if (err.code === "P2025") {
      return new AppError("Tag is not attached to note", 404);
    }
    if (err.code === "P2003") {
      return new AppError("Invalid tag association", 400);
    }
  }

  return new AppError("Invalid request data", 400);
}

async function enrichWithTags(note) {
  const tagIds = await getTagsForNote(note.id);

  if (tagIds.length === 0) {
    return { ...note, tags: [] };
  }

  const tagsById = await fetchTagsByIds(tagIds);
  const tags = tagIds.map((id) => tagsById.get(id)).filter(Boolean);
  return { ...note, tags };
}

async function fetchTagsByIds(tagIds) {
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return new Map();
  }

  try {
    const response = await axios.post(`${TAGS_SERVICE_URL}/tags/batch`, {
      ids: tagIds,
    });
    const batch = response.data?.data;
    const tags = Array.isArray(batch) ? batch : [];
    return new Map(tags.filter((tag) => tag && typeof tag.id === "string").map((tag) => [tag.id, tag]));
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return new Map();
    }
    throw err;
  }
}

async function listNotes(userId, filters = {}) {
  try {
    const notes = await findNotesByUserId(userId, filters);
    if (notes.length === 0) {
      return [];
    }

    const tagsByNoteId = await getTagsForNotes(notes.map((note) => note.id));
    const allUniqueTagIds = [...new Set([...tagsByNoteId.values()].flat())];
    const tagsById = await fetchTagsByIds(allUniqueTagIds);

    return notes.map((note) => {
      const noteTagIds = tagsByNoteId.get(note.id) || [];
      const tags = noteTagIds.map((id) => tagsById.get(id)).filter(Boolean);
      return { ...note, tags };
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function getNote(noteId, userId) {
  try {
    const note = await findNoteById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (note.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return enrichWithTags(note);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function createNote(userId, data) {
  try {
    const note = await createNoteRepo(userId, data);
    return enrichWithTags(note);
  } catch (err) {
    const mappedError = mapPrismaError(err, "createNote");
    if (mappedError) {
      throw mappedError;
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function updateNote(noteId, userId, data) {
  try {
    const existingNote = await findNoteById(noteId);
    if (!existingNote) {
      throw new AppError("Note not found", 404);
    }

    if (existingNote.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    const updated = await updateNoteRepo(noteId, data);
    return enrichWithTags(updated);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function deleteNote(noteId, userId) {
  try {
    const existingNote = await findNoteById(noteId);
    if (!existingNote) {
      throw new AppError("Note not found", 404);
    }

    if (existingNote.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return deleteNoteRepo(noteId);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function addTag(noteId, userId, tagId) {
  try {
    const note = await findNoteById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (note.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return addTagToNote(noteId, tagId);
  } catch (err) {
    const mappedError = mapPrismaError(err, "addTag");
    if (mappedError) {
      throw mappedError;
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

async function removeTag(noteId, userId, tagId) {
  try {
    const note = await findNoteById(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (note.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return removeTagFromNote(noteId, tagId);
  } catch (err) {
    const mappedError = mapPrismaError(err, "removeTag");
    if (mappedError) {
      throw mappedError;
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Internal server error", 500);
  }
}

export { addTag, createNote, deleteNote, getNote, listNotes, removeTag, updateNote };
