import { Router } from "express";
import {
  getStudentInfo,
  loginStudent,
  registerStudent,
  resendOtp,
  saveIndosNumber,
  saveStudentDocument,
  saveStudentForm,
  sendResetPasswordEmail,
  setNewPassword,
  uploadProfileImage,
  verifyOtp,
} from "../controller/student.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { upload } from "../middleware/multer";

export const studentRouter = Router();

studentRouter
  .get("/", isAuthenticated, getStudentInfo)
  .post("/register", registerStudent)
  .post("/resend-otp", resendOtp)
  .post("/login", loginStudent)
  .post("/verify-otp", verifyOtp)
  .post("/forgot-password", sendResetPasswordEmail)
  .post("/profile-image", upload.single("profile_image"), uploadProfileImage)
  .patch("/set-password", setNewPassword)
  .put("/save-form", isAuthenticated, saveStudentForm)
  .put("/save-doc", isAuthenticated, saveStudentDocument)
  .patch("/save-indos-number", isAuthenticated, saveIndosNumber)
