import express from "express";
import {
  getAllUsers,
  getAUser,
  loginUser,
  updateName,
  verifyOTP,
} from "../controllers/user.js";
import { isAuth, myProfile } from "../middleware/isAuth.js";

const router = express.Router();
router.post("/login", loginUser);
router.post("/verify", verifyOTP);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", isAuth, getAUser);
router.post("/update/user", isAuth, updateName);

export default router;
