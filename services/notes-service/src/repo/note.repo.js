import { prisma } from "../model/db.js";

async function findNoteById(id) {
  return prisma.note.findUnique({ where: { id } });
}

async function findNotesByUserId(userId, filters = {}) {
  const where = {
    userId,
    ...filters,
  };

  if (filters.tagId) {
    where.noteTags = { some: { tagId: filters.tagId } };
    delete where.tagId;
  }

  return prisma.note.findMany({ where });
}

async function createNote(userId, data) {
  return prisma.note.create({
    data: {
      userId,
      ...data,
    },
  });
}

async function updateNote(id, data) {
  return prisma.note.update({ where: { id }, data });
}

async function deleteNote(id) {
  return prisma.note.delete({ where: { id } });
}

async function addTagToNote(noteId, tagId) {
  return prisma.noteTag.create({ data: { noteId, tagId } });
}

async function removeTagFromNote(noteId, tagId) {
  return prisma.noteTag.delete({
    where: {
      noteId_tagId: {
        noteId,
        tagId,
      },
    },
  });
}

async function getTagsForNote(noteId) {
  const tags = await prisma.noteTag.findMany({
    where: { noteId },
    select: { tagId: true },
  });

  return tags.map((item) => item.tagId);
}

async function getTagsForNotes(noteIds) {
  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return new Map();
  }

  const noteTags = await prisma.noteTag.findMany({
    where: { noteId: { in: noteIds } },
    select: { noteId: true, tagId: true },
  });

  const tagsByNoteId = new Map();

  for (const { noteId, tagId } of noteTags) {
    if (!tagsByNoteId.has(noteId)) {
      tagsByNoteId.set(noteId, []);
    }
    tagsByNoteId.get(noteId).push(tagId);
  }

  return tagsByNoteId;
}

export {
  addTagToNote,
  createNote,
  deleteNote,
  findNoteById,
  findNotesByUserId,
  getTagsForNote,
  getTagsForNotes,
  removeTagFromNote,
  updateNote,
};
