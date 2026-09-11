import { Router } from "express";
import * as locationController from "../controllers/location.controller";
import { validateCreateLocation, validateUpdateLocation } from "../middleware/validateLocation";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), validateCreateLocation, locationController.create);
router.get("/", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), locationController.list);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER", "VIEWER"), locationController.getById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), validateUpdateLocation, locationController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "ASSET_MANAGER"), locationController.remove);

export default router;
