import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import {
  addTagHandler,
  createNoteHandler,
  deleteNoteHandler,
  getNoteHandler,
  listNotesHandler,
  removeTagHandler,
  updateNoteHandler,
} from "../controller/note.controller.js";

const router = Router();

router.get("/notes", authenticate, listNotesHandler);
router.post("/notes", authenticate, createNoteHandler);
router.get("/notes/:id", authenticate, getNoteHandler);
router.put("/notes/:id", authenticate, updateNoteHandler);
router.delete("/notes/:id", authenticate, deleteNoteHandler);
router.post("/notes/:id/tags", authenticate, addTagHandler);
router.delete("/notes/:id/tags/:tagId", authenticate, removeTagHandler);

export default router;
