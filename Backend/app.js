import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import medicineRouter from "./routes/medicineRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import prescriptionRouter from "./routes/prescriptionRoute.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
  override: process.env.NODE_ENV !== "production"
});

if (process.env.DNS_SERVERS || process.env.FORCE_IPV4 === "true") {
  const dns = await import("dns");

  if (process.env.DNS_SERVERS) {
    dns.setServers(
      process.env.DNS_SERVERS.split(",").map((v) => v.trim()).filter(Boolean)
    );
  }

  if (process.env.FORCE_IPV4 === "true") {
    dns.setDefaultResultOrder("ipv4first");
  }
}

const app = express();
const port = process.env.PORT || 4000;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.disable("x-powered-by");

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim())
      : true,
    credentials: true
  })
);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later" }
});

app.use(globalLimiter);
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// NoSQL injection prevention
app.use(mongoSanitize());

// DB
await connectDB();

// Static files
app.use("/images", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/medicine", medicineRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/prescription", prescriptionRouter);

// Health & test
app.get("/", (req, res) => {
  res.send("MediCartix API Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Started On http://localhost:${port}`);
});
