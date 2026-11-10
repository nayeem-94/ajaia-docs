
import express from "express";

import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} from "../controllers/document.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
