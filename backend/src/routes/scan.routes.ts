import { Router } from "express";
import * as scanController from "../controllers/scan.controller";
import { validateCreateScan } from "../middleware/validateScan";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), validateCreateScan, scanController.create);
router.get("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), scanController.list);
router.get("/asset/:assetId", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), scanController.getAssetScanHistory);

export default router;
