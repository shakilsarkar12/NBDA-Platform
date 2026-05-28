import { Router } from "express";
import { assertAuthenticated, requireAuth } from "../middleware/auth.middleware.js";
import {
  createBloodRequest,
  listActiveBloodRequests,
} from "../services/request.service.js";

export const requestsRouter = Router();

requestsRouter.get("/", async (_req, res, next) => {
  try {
    const requests = await listActiveBloodRequests();
    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

requestsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    const request = await createBloodRequest({
      ...req.body,
      createdByUserId: auth.userId,
    });
    res.status(201).json({
      success: true,
      message: "Your request is pending volunteer verification.",
      request,
    });
  } catch (error) {
    next(error);
  }
});

