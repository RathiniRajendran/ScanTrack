import { Router } from "express";
import * as assetController from "../controllers/asset.controller";
import { validateCreateAsset, validateUpdateAsset, validateUpdateAssetLocation } from "../middleware/validateAsset";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), validateCreateAsset, assetController.create);
router.get("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), assetController.list);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), assetController.getById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), validateUpdateAsset, assetController.update);
router.patch("/:id/location", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), validateUpdateAssetLocation, assetController.updateLocation);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), assetController.archive);

export default router;
