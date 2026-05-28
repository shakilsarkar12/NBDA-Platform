import { Router, type Response } from "express";
import {
  loginUser,
  registerUser,
  verifyOtpAndRegister,
  type CompleteRegistrationInput,
  type LoginInput,
  type RegisterInput,
} from "../services/auth.service.js";
import { assertAuthenticated, requireAuth } from "../middleware/auth.middleware.js";
import {
  logBloodDonation,
  setAvailability,
  getUserByIdOrThrow,
  updateUserProfile,
} from "../services/user.service.js";
import { AppError } from "../utils/errors.js";

export const authRouter = Router();

function setAuthCookie(res: Response, token: string) {
  res.cookie("nbda_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

authRouter.post("/register", async (req, res) => {
  try {
    const input = req.body as RegisterInput;
    const result = await registerUser(input);
    res.status(200).json(result);
  } catch (error) {
    handleAuthRouteError(error, res);
  }
});

authRouter.post("/verify-otp-and-register", async (req, res) => {
  try {
    const input = req.body as CompleteRegistrationInput;
    const { user, accessToken } = await verifyOtpAndRegister(input);
    setAuthCookie(res, accessToken);
    res.status(200).json({
      success: true,
      message: "Registration completed successfully.",
      accessToken,
      user,
    });
  } catch (error) {
    handleAuthRouteError(error, res);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const input = req.body as LoginInput;
    const { user, accessToken } = await loginUser(input);
    setAuthCookie(res, accessToken);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      user,
    });
  } catch (error) {
    handleAuthRouteError(error, res);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("nbda_token");
  res.status(200).json({ success: true, message: "Logout successful." });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    const user = await getUserByIdOrThrow(auth.userId);
    user.password = undefined as unknown as string;
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/availability", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    if (typeof req.body?.isAvailable !== "boolean") {
      throw new AppError("isAvailable must be boolean", "VALIDATION_ERROR", 400);
    }
    const isAvailable = req.body.isAvailable;
    const user = await setAvailability(auth.userId, isAvailable);
    user.password = undefined as unknown as string;
    res.status(200).json({
      success: true,
      message: "Availability updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/donation/log", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    const user = await logBloodDonation(auth.userId);
    user.password = undefined as unknown as string;
    res.status(200).json({
      success: true,
      message: "Donation logged successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const auth = assertAuthenticated(req);
    const user = await updateUserProfile(auth.userId, req.body ?? {});
    user.password = undefined as unknown as string;
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
});

function handleAuthRouteError(error: unknown, res: Response): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });
    return;
  }

  console.error("[auth] unexpected error:", error);
  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
}
