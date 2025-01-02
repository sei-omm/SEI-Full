import { Router } from "express";
import {
  downloadLibraryFile,
  generateFileLink,
  getLibraryInfo,
  getLibraryInfoForStudent,
  getLibraryInfoWithFilter,
  getSingleLibraryInfo,
  insertNewItem,
  streamBlobLibraryFileForStudnets,
  updateLibraryItem,
  updateVisibility,
} from "../controller/library.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const libraryRouter = Router();

libraryRouter
  .get(
    "/view-file/:file_name",
    isAuthenticated,
    streamBlobLibraryFileForStudnets
  )
  .get("/generate-link", isAuthenticated, generateFileLink)
  .get("/download-file/:library_item_id", isAuthenticated, downloadLibraryFile)
  .get("/student", isAuthenticated, getLibraryInfoForStudent)
  .get("/", getLibraryInfo) //this should be procted for crm only
  .get("/filter", getLibraryInfoWithFilter) //this should be procted for crm only
  .get("/:library_id", getSingleLibraryInfo) //this should be procted for crm only
  .post("/", insertNewItem) //this should be procted for crm only
  .put("/:library_id", updateLibraryItem) //this should be procted for crm only
  .patch("/:library_id", updateVisibility); //this should be procted for crm only
