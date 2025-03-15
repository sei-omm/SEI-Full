import { Router } from "express";
import {
  createdFolder,
  deleteFile,
  deleteFolder,
  getFilesAndFolders,
  renameFile,
  renameFolder,
  saveFileInfoToDb,
  searchFile,
} from "../controller/storage.controller";

export const storageRouter = Router(); // i protact this route globally inside index.ts file

storageRouter
  .get("/", getFilesAndFolders)
  .post("/folder", createdFolder)
  .patch("/folder/:folder_id", renameFolder)
  .delete("/folder/:folder_id", deleteFolder)

  .post("/file", saveFileInfoToDb)
  .patch("/file/:file_id", renameFile)
  .delete("/file/:file_id", deleteFile)

  .get("/search", searchFile);
