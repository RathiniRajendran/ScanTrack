import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import assetRoutes from "./routes/asset.routes";
import locationRoutes from "./routes/location.routes";
import scanRoutes from "./routes/scan.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import auditRoutes from "./routes/audit.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request: Request, response: Response): void => {
  response.status(200).json({
    success: true,
    message: "ScanTrack API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/assets", assetRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audits", auditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, (): void => {
  console.log(`ScanTrack API running on http://localhost:${port}`);
});