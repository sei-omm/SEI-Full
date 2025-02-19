import { Router } from "express";
import {
  addPhyLibBooks,
  downloadLibraryFile,
  getBookIssueList,
  // generateFileLink,
  getLibraryInfo,
  getLibraryInfoForStudent,
  getLibraryInfoWithFilter,
  getPhysicalLibBooks,
  getSingleLibraryInfo,
  insertNewItem,
  issueBooksToStudent,
  returnBookBulk,
  streamBlobLibraryFileForStudnets,
  updateLibraryItem,
  updatePhyLibBooks,
  updateVisibility,
} from "../controller/library.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const libraryRouter = Router();

libraryRouter
  //Physical Library
  .get("/physical/books", getPhysicalLibBooks)
  .get("/physical/books/issue", getBookIssueList)

  .post("/physical/books", addPhyLibBooks)
  .put("/physical/books", updatePhyLibBooks)

  .post("/physical/issue-book", issueBooksToStudent)
  .patch("/physical/books/return", returnBookBulk)

  //for online library
  .get(
    "/view-file/:file_name",
    isAuthenticated,
    streamBlobLibraryFileForStudnets
  )
  // .get("/generate-link", isAuthenticated, generateFileLink)
  .get("/download-file/:library_item_id", isAuthenticated, downloadLibraryFile)
  .get("/student", isAuthenticated, getLibraryInfoForStudent)
  .get("/", getLibraryInfo) //this should be procted for crm only
  .get("/filter", getLibraryInfoWithFilter) //this should be procted for crm only

  .post("/", insertNewItem) //this should be procted for crm only
  .put("/:library_id", updateLibraryItem) //this should be procted for crm only
  .patch("/:library_id", updateVisibility) //this should be procted for crm only

  .get("/:library_id", getSingleLibraryInfo); //this should be procted for crm only
