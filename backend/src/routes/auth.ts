import { Router, type Response } from "express";
import {
  loginUser,
  registerUser,
  verifyOtpAndRegister,
  type CompleteRegistrationInput,
  type LoginInput,
  type RegisterInput,
} from "../services/auth.service.js";
import { AppError } from "../utils/errors.js";

export const authRouter = Router();

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
