import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Mount sub-routers
router.use("/auth", authRoutes);

// Health check — useful for Docker / load-balancer probes
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
