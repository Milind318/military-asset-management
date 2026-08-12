import express from "express";
import {
  getDashboardMetrics,
  getInventory,
  getBases,
  getEquipment
} from "../controllers/assetController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { enforceBaseScope } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/dashboard", enforceBaseScope, getDashboardMetrics);
router.get("/inventory", enforceBaseScope, getInventory);
router.get("/bases", getBases);
router.get("/equipment", getEquipment);

export default router;
