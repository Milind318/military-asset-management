import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Military Asset Management API - MySQL",
    status: "running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/operations", assignmentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
