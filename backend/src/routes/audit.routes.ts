import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import * as auditController from "../controllers/audit.controller";

const router = Router();

router.get("/", authenticate, auditController.list);

router.get(
  "/asset/:assetId",
  authenticate,
  auditController.listByAsset
);

export default router;