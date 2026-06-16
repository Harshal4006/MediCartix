import express from "express";
import { loginUser, registerUser, logoutUser, getUser, getFullProfile, updateUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/me", authMiddleware, getUser);
userRouter.get("/profile", authMiddleware, getFullProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);

export default userRouter;