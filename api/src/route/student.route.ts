import { Router } from "express";
import {
  getStudentInfo,
  getStudentRegisterFormInfo,
  loginStudent,
  registerStudent,
  resendOtp,
  saveIndosNumber,
  saveProfileImage,
  saveStudentDocument,
  saveStudentForm,
  searchStudent,
  sendResetPasswordEmail,
  setNewPassword,
  verifyOtp,
} from "../controller/student.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const studentRouter = Router();

studentRouter
  .get("/", isAuthenticated, getStudentInfo)
  .get("/admission-form", isAuthenticated, getStudentRegisterFormInfo)
  .post("/register", registerStudent)
  .post("/resend-otp", resendOtp)
  .post("/login", loginStudent)
  .post("/verify-otp", verifyOtp)
  .post("/forgot-password", sendResetPasswordEmail)
  .post("/profile-image", isAuthenticated, saveProfileImage)
  .patch("/set-password", setNewPassword)
  .put("/save-form", isAuthenticated, saveStudentForm)
  .put("/save-doc", isAuthenticated, saveStudentDocument)
  .patch("/save-indos-number", isAuthenticated, saveIndosNumber)
  .get("/search", searchStudent)
