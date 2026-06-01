import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notification.controller";

const router = Router();

router.use(requireAuth);
router.get(ROUTES.ROOT, getNotifications);
router.patch(ROUTES.NOTIFICATIONS.READ_ALL, markAllAsRead);
router.patch(ROUTES.NOTIFICATIONS.READ, markAsRead);

export default router;
