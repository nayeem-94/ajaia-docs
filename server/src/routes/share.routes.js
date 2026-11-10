
import express from "express";

import {
  shareDocument,
  getDocumentShares,
  removeShare
} from "../controllers/share.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/:id", shareDocument);
router.get("/:id", getDocumentShares);
router.delete("/:id/:shareId", removeShare);

export default router;
