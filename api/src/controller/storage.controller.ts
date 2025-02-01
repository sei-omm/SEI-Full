import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  createdFolderValidator,
  deleteFolderValidator,
  renameFolderValidator,
  getFilesAndFoldersValidator,
  saveFileInfoToDbValidator,
  renameFileValidator,
  deleteFileValidator,
} from "../validator/storage.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { transaction } from "../utils/transaction";
import { del } from "@vercel/blob";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { parsePagination } from "../utils/parsePagination";

// export const getFilesAndFolders = asyncErrorHandler(
//   async (req: Request, res: Response) => {

//     const { error, value } = getFilesAndFoldersValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     //if folder id come -1 or 0 then it will consider get all folder and files form main (master folder)
//     if (value.folder_id === -1 || value.folder_id === 0) {
//       const { rows } = await pool.query(
//         `
//         SELECT

//         f.*,
//         COALESCE(JSON_AGG(fil) FILTER (WHERE fil.folder_id IS NOT NULL), '[]'::json) AS files

//         FROM folders AS f

//         LEFT JOIN files AS fil
//         ON fil.folder_id = f.parent_folder_id

//         WHERE parent_folder_id IS NULL

//         GROUP BY f.folder_id

//         `
//       );
//       return res.status(200).json(new ApiResponse(200, "", rows));
//     }

//     const { rows } = await pool.query(
//         `
//         SELECT

//         f.*,
//         COALESCE(JSON_AGG(fil) FILTER (WHERE fil.folder_id IS NOT NULL), '[]'::json) AS files

//         FROM folders AS f

//         LEFT JOIN files AS fil
//         ON fil.folder_id = f.parent_folder_id

//         WHERE parent_folder_id = $1

//         GROUP BY f.folder_id

//         `,
//         [value.folder_id]
//       );
//       return res.status(200).json(new ApiResponse(200, "", rows));
//   }
// );

// for getting files and folders
export const getFilesAndFolders = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = getFilesAndFoldersValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    //if folder id come -1 or 0 then it will consider get all folder and files form main (master folder)
    if (value.folder_id === -1 || value.folder_id === 0) {
      const response = await transaction([
        {
          sql: "SELECT * FROM folders WHERE parent_folder_id IS NULL",
          values: [],
        },
        {
          sql: "SELECT * FROM files WHERE folder_id IS NULL",
          values: [],
        },
      ]);
      return res.status(200).json(
        new ApiResponse(200, "", {
          folders: response[0].rows,
          files: response[1].rows,
        })
      );
    }

    const response = await transaction([
      {
        sql: "SELECT * FROM folders WHERE parent_folder_id = $1",
        values: [value.folder_id],
      },
      {
        sql: "SELECT * FROM files WHERE folder_id = $1",
        values: [value.folder_id],
      },
    ]);
    res.status(200).json(
      new ApiResponse(200, "", {
        folders: response[0].rows,
        files: response[1].rows,
      })
    );
  }
);

//for folders
export const createdFolder = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = createdFolderValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `INSERT INTO folders (folder_name, parent_folder_id) VALUES ($1, $2)`,
      [value.folder_name, value.parent_folder_id]
    );

    res.status(201).json(new ApiResponse(201, "New Folder Has Created"));
  }
);

export const renameFolder = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = renameFolderValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE folders SET folder_name = $1 WHERE folder_id = $2`,
      [value.folder_name, value.folder_id]
    );

    res.status(200).json(new ApiResponse(200, "Folder Has Renamed"));
  }
);

export const deleteFolder = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise(resolve => setTimeout(() => resolve(""), 3000))

    const { error, value } = deleteFolderValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM folders WHERE folder_id = $1`, [
      value.folder_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Folder Has Removed"));
  }
);

//for files (could be multiple files)
export const saveFileInfoToDb = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = saveFileInfoToDbValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `INSERT INTO files (file_name, file_type, file_url, folder_id) VALUES ${
        sqlPlaceholderCreator(4, value.length).placeholder
      }`,
      // [value[0].file_name, value[0].file_type, value[0].file_url, value[0].folder_id]
      value.flatMap((item) => [
        item.file_name,
        item.file_type,
        item.file_url,
        item?.folder_id,
      ])
    );

    res.status(201).json(new ApiResponse(201, "New File Has Uploaded"));
  }
);

export const renameFile = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = renameFileValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`UPDATE files SET file_name = $1 WHERE file_id = $2`, [
      value.file_name,
      value.file_id,
    ]);

    res.status(200).json(new ApiResponse(200, "File Has Renamed"));
  }
);

export const deleteFile = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = deleteFileValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rowCount, rows } = await pool.query(
      `DELETE FROM files WHERE file_id = $1 RETURNING file_url`,
      [value.file_id]
    );
    if (rowCount != 0) {
      await del(rows[0].file_url);
    }

    res.status(200).json(new ApiResponse(200, "File Has Removed"));
  }
);

export const searchFile = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT * FROM files WHERE file_name ILIKE '%' || $1 || '%'
    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [req.query.q]
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Search Result", { folders: [], files: rows }));
});
