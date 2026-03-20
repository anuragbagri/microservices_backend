import { prisma } from "../model/db.js";

async function findTagById(id) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });
  return tag || null;
}

async function findTagsByUserId(userId) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

async function findTagsByIds(ids) {
  if (!ids.length) {
    return [];
  }
  return prisma.tag.findMany({
    where: { id: { in: ids } },
  });
}

async function createTag(userId, data) {
  return prisma.tag.create({
    data: {
      userId,
      name: data.name,
      ...(data.color !== undefined && { color: data.color }),
    },
  });
}

async function updateTag(id, data) {
  return prisma.tag.update({
    where: { id },
    data,
  });
}

async function deleteTag(id) {
  return prisma.tag.delete({
    where: { id },
  });
}

export {
  createTag,
  deleteTag,
  findTagById,
  findTagsByIds,
  findTagsByUserId,
  updateTag,
};
