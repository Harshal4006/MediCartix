import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import { getDashboard } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", authMiddleware, adminMiddleware, getDashboard);

export default dashboardRouter;
