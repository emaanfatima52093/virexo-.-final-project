require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { generalLimiter } = require("./middleware/rateLimiters");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");

// Fail fast on missing critical secrets in production.
if (process.env.NODE_ENV === "production") {
  const required = ["JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

const app = express();
app.set("trust proxy", 1);

// --- Security headers ---
app.use(
  helmet({
    contentSecurityPolicy: false, // configure per-deployment if serving frontend from same origin with inline scripts
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(generalLimiter);

// Parse JSON request bodies before API routes.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  });
});

// --- API routes ---
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// --- Static frontend ---
const frontendDir = path.resolve(__dirname, "..", "frontend");
app.use(express.static(frontendDir, { maxAge: "1d", extensions: ["html"] }));
app.get("/", (req, res) => res.sendFile(path.join(frontendDir, "index.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(frontendDir, "admin.html")));

app.use("/api", notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Virexo Innovations server running on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠ OPENAI_API_KEY not set — /api/chat will return a graceful 'unavailable' response.");
  }
  if (!process.env.SMTP_HOST) {
    console.warn("⚠ SMTP not configured — contact form will save to the database but skip emails.");
  }
});

module.exports = app;
