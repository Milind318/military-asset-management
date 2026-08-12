import express from "express";
import {
  listTransfers,
  createTransfer
} from "../controllers/transferController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", listTransfers);
router.post(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  createTransfer
);

export default router;
