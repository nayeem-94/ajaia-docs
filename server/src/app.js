
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import shareRoutes from "./routes/share.routes.js";






dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Ajaia Docs API",
    status: "running"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy", database: "connected" });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/shares", shareRoutes);







