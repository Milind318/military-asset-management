import express from "express";
import {
  listAssignments,
  createAssignment,
  listExpenditures,
  createExpenditure
} from "../controllers/assignmentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/assignments", listAssignments);
router.post(
  "/assignments",
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createAssignment
);

router.get("/expenditures", listExpenditures);
router.post(
  "/expenditures",
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createExpenditure
);

export default router;
