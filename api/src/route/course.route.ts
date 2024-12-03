import { Router } from "express";
import {
  addNewCourse,
  deleteCourse,
  deleteCourseBatch,
  // enrolCourse,
  // fillUpCourseForm,
  getAllCourse,
  getCoursesWithBatch,
  getMultiCoursesPrices,
  getCourseBatch,
  getSingleCourse,
  searchCourse,
  insertNewCourseBatch,
  updateCourseInfo,
  updateCourseBatchInfo,
  getMultiBatchPrices,
  enrollToBatch,
  getCoursesRequiredDocuments,
  getCoursesForDropDown,
} from "../controller/course.controller";
import { upload } from "../middleware/multer";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const courseRouter = Router();

courseRouter
  .get("/", getAllCourse)
  .get("/with-batches", getCoursesWithBatch)
  .get("/search", searchCourse)
  .get("/required-documents", isAuthenticated, getCoursesRequiredDocuments)
  .get("/get-multi-course-price", getMultiCoursesPrices)
  .get("/get-multi-batch-price", getMultiBatchPrices)
  .get("/drop-down", getCoursesForDropDown)
  .get("/:course_id", getSingleCourse)
  .post("/", upload.fields([{ name: "course_pdf", maxCount: 1 }]), addNewCourse)
  .put(
    "/:course_id",
    upload.fields([{ name: "course_pdf", maxCount: 1 }]),
    updateCourseInfo
  )
  .delete("/:course_id", deleteCourse)
  // .post("/enroll/:course_id", isAuthenticated, enrolCourse)
  // .post("/enroll", isAuthenticated, enrolCourse)
  .post("/enroll", isAuthenticated, enrollToBatch)
  // .post("/fill-form/:course_id", fillUpCourseForm) //can done only buy student and admin
  .get("/batch/:course_id", getCourseBatch)
  .post("/batch", insertNewCourseBatch)
  .put("/batch/:batch_id", updateCourseBatchInfo)
  .delete("/batch/:batch_id", deleteCourseBatch);
