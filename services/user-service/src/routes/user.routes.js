import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import {
  deleteMeHandler,
  getMeHandler,
  getPublicProfileHandler,
  updateMeHandler,
} from "../controller/user.controller.js";

const router = Router();

router.get("/users/me", authenticate, getMeHandler);
router.put("/users/me", authenticate, updateMeHandler);
router.delete("/users/me", authenticate, deleteMeHandler);
router.get("/users/:id", getPublicProfileHandler);

export default router;
