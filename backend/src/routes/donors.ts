import { Router } from "express";
import { assertAuthenticated, requireAuth } from "../middleware/auth.middleware.js";
import {
  searchDonorsMasked,
  viewDonorContactWithAudit,
} from "../services/user.service.js";
import { AppError } from "../utils/errors.js";

export const donorsRouter = Router();

donorsRouter.get("/search", async (_req, res, next) => {
  try {
    const donors = await searchDonorsMasked();
    res.status(200).json({ success: true, donors });
  } catch (error) {
    next(error);
  }
});

donorsRouter.post("/view-contact", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    const donorId = String(req.body?.donorId ?? "").trim();
    if (!donorId) {
      throw new AppError("donorId is required", "VALIDATION_ERROR", 400);
    }

    const result = await viewDonorContactWithAudit(auth.userId, donorId);
    res.status(200).json({
      success: true,
      message: "Contact viewed successfully.",
      phone: result.phone,
    });
  } catch (error) {
    next(error);
  }
});

