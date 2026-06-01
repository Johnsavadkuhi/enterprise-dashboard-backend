import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { csrfTokenHandler } from "@/middlewares/csrf.middleware";
import { login, logout, me, refreshToken, register } from "../controllers/auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import { requireAuth } from "@/middlewares/auth.middleware";

const router = Router();

router.post(ROUTES.AUTH.REGISTER, validate(registerSchema), register);
router.post(ROUTES.AUTH.LOGIN, validate(loginSchema), login);
router.get(ROUTES.AUTH.CSRF_TOKEN, csrfTokenHandler);
router.get(ROUTES.AUTH.ME, requireAuth, me);
router.post(ROUTES.AUTH.REFRESH_TOKEN, refreshToken);
router.post(ROUTES.AUTH.LOGOUT, logout);

export default router;
