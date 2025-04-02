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
  getCourseWithBatchStudents,
  getCoursesWithSubject,
  getMultipleBatchWithId,
  changeBatchManually,
  // generateTimeTable,
  saveTimeTable,
  draftTimeTable,
  removeFromDraft,
  generateTimeTable2,
  getPackageCourses,
  addNewPackage,
  getSinglePackage,
  setVisibility,
  updateSinglePackageInfo,
  getPackageBatchWithId,
  // deleteSingleCourseFromPackage,
} from "../controller/course.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { checkPermission } from "../middleware/checkPermission";

export const courseRouter = Router();

courseRouter
  .get("/", getAllCourse)
  .get("/with-batches/student", getCourseWithBatchStudents)
  .get(
    "/with-batches",
    getCoursesWithBatch
  ) /* bydefault with pagination | modify to -> ?nopagination=true || ?course_ids=11,10&institute=Kolkata&nopagination=false&fields=course_id:course_name */
  .get("/with-subjects", getCoursesWithSubject)
  .get("/search", searchCourse)
  .get("/required-documents", isAuthenticated, getCoursesRequiredDocuments)
  .get("/get-multi-course-price", getMultiCoursesPrices)
  .get("/get-multi-batch-price", getMultiBatchPrices)
  .get("/drop-down", getCoursesForDropDown)

  .post("/", isAuthenticated, checkPermission, addNewCourse)
  .put("/:course_id", isAuthenticated, checkPermission, updateCourseInfo)
  .delete("/:course_id", isAuthenticated, checkPermission, deleteCourse)
  // .post("/enroll/:course_id", isAuthenticated, enrolCourse)
  // .post("/enroll", isAuthenticated, enrolCourse)
  .post("/enroll", isAuthenticated, enrollToBatch)
  // .post("/fill-form/:course_id", fillUpCourseForm) //can done only buy student and admin
  .get("/get-batch", getMultipleBatchWithId)
  .get("/batch/:course_id", getCourseBatch)

  .post("/batch", isAuthenticated, checkPermission, insertNewCourseBatch)
  .put(
    "/batch/:batch_id",
    isAuthenticated,
    checkPermission,
    updateCourseBatchInfo
  )
  .delete(
    "/batch/:batch_id",
    isAuthenticated,
    checkPermission,
    deleteCourseBatch
  )
  .patch("/batch", isAuthenticated, checkPermission, changeBatchManually) //chnage batch manually -> only access by marketing team

  // .get("/time-table", generateTimeTable)
  .get("/time-table/v2", generateTimeTable2)
  .post("/time-table", saveTimeTable)
  .post("/time-table/draft", draftTimeTable)
  .delete("/time-table/draft/:draft_id", removeFromDraft)

  // package courses
  .get("/package", getPackageCourses)
  .get("/package/batches", getPackageBatchWithId)
  .post("/package", addNewPackage)
  .get("/package/:package_id", getSinglePackage)
  .patch("/package/:package_id", setVisibility)
  .put("/package/:package_id", updateSinglePackageInfo)
  // .delete("/package/course/:row_id", deleteSingleCourseFromPackage)

  //single course info
  .get("/:course_id", getSingleCourse);
