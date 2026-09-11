import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateLogin, validateRegister } from "../middleware/validateAuth";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", authenticate, authController.me);

export default router;
