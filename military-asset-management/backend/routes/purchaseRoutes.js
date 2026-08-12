import express from "express";
import {
  listPurchases,
  createPurchase
} from "../controllers/purchaseController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", listPurchases);
router.post(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  createPurchase
);

export default router;
