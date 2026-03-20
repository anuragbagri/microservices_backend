import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import {
  createTagHandler,
  deleteTagHandler,
  getTagHandler,
  getTagsByIdsHandler,
  listTagsHandler,
  updateTagHandler,
} from "../controller/tag.controller.js";

const router = Router();

router.post("/tags/batch", getTagsByIdsHandler);
router.get("/tags", authenticate, listTagsHandler);
router.post("/tags", authenticate, createTagHandler);
router.get("/tags/:id", authenticate, getTagHandler);
router.put("/tags/:id", authenticate, updateTagHandler);
router.delete("/tags/:id", authenticate, deleteTagHandler);

export default router;
