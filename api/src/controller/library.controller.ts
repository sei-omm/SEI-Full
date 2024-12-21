import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {
  downloadFileValidator,
  getLibraryInfoWithFilterValidator,
  getSingleLibraryValidator,
  insertLibraryItemValidator,
  updateLibraryItemValidator,
  updateVisibilityValidator,
} from "../validator/library.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { pool } from "../config/db";
import https from "https";
import { tryCatch } from "../utils/tryCatch";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { getLibraryStudentValidator } from "../validator/student.validator";

export const streamBlobLibraryFileForStudnets = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const fileName = req.params.file_name;
    if (!fileName) throw new ErrorHandler(400, "file-name is required");

    if (process.env.HOST_URL?.includes(req.headers.referer || "") || req.headers.referer?.includes(process.env.HOST_URL || "")) {
      throw new ErrorHandler(400, "You are not able to access this resources");
    }

    const libraryStorageHostURL =
      "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/library-files";

    https
      .get(`${libraryStorageHostURL}/${fileName}`, (blobRes) => {
        // Forward Content-Type header
        const contentType = blobRes.headers["content-type"];
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }

        // Forward Content-Length header if available
        const contentLength = blobRes.headers["content-length"];
        if (contentLength) {
          res.setHeader("Content-Length", contentLength);
        }

        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "no-store");
        // else {
        //   console.warn('Content-Length header is missing');
        // }

        // Stream the response to the client
        blobRes.pipe(res);
      })
      .on("error", (err) => {
        // console.error(err);
        res.status(500).send("Error streaming the file");
      });
  }
);

export const downloadLibraryFile = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = downloadFileValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `SELECT * FROM library WHERE library_id = $1 AND allow_download = true`,
      [req.params.library_item_id]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "Resource Not Found");

    const resourcesLink = rows[0].library_resource_link;
    https
      .get(resourcesLink, (blobRes) => {
        // Forward Content-Type header
        const contentType = blobRes.headers["content-type"];
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }

        // Forward Content-Length header if available
        const contentLength = blobRes.headers["content-length"];
        if (contentLength) {
          res.setHeader("Content-Length", contentLength);
        }

        // const fileName = resourcesLink.split("/").
        const fileName = new URL(resourcesLink).pathname.split('/').pop();
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        blobRes.pipe(res);
      })
      .on("error", (err) => {
        // console.error(err);
        res.status(500).send("Error streaming the file");
      });
  }
);

export const getLibraryInfoForStudent = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getLibraryStudentValidator.validate({
      ...req.query,
      ...res.locals,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const studentId = res.locals.student_id;
    const visibility = req.query.visibility;
    const itemId = req.query.item_id;

    if (visibility === "subject-specific") {
      const { rows } = await pool.query(
        `
        SELECT 
        l.*
        FROM library AS l

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id

        WHERE lws.subject_id = $1
      `,
        [itemId]
      );

      res.status(200).json(new ApiResponse(200, "", rows));

      return;
    }

    const sql = `
        SELECT 
          l.*,
          CASE WHEN l.library_file_type <> 'link' THEN SUBSTRING(l.library_resource_link FROM '([^/]+)$') ELSE l.library_resource_link END AS library_resource_link
        FROM library AS l

        LEFT JOIN library_with_course AS lwc
        ON lwc.library_id = l.library_id

        LEFT JOIN enrolled_batches_courses AS ebc
            ON ebc.student_id = $1

        LEFT JOIN course_batches AS cb
            ON cb.batch_id = ebc.batch_id

        WHERE 
            l.is_active = true
            AND lwc.course_id = ebc.course_id
            AND (SELECT SUM(paid_amount) FROM payments WHERE batch_id = ebc.batch_id AND student_id = $1) = cb.batch_fee
            ${
              visibility === "course-specific"
                ? "AND lwc.course_id = $2"
                : "OR l.visibility = 'subject-specific'"
            }

        GROUP BY l.library_id
  `;

    const valueToStore: (string | number)[] = [studentId];
    if (visibility === "course-specific") {
      valueToStore.push(itemId as any);
    }

    const { rows } = await pool.query(sql, valueToStore);

    res.status(200).json(new ApiResponse(200, "", rows));

    //manage filters
    // const courseId = req.query.course_id;
    // const libraryFileType = req.query.library_file_type;
    // let condition = "";
    // const valuesForFilter: (string | number)[] = [];

    // if (courseId && libraryFileType) {
    //   condition += "AND l.course_id = $2 AND l.library_file_type = $3";
    //   valuesForFilter.push(
    //     parseInt(courseId.toString()),
    //     libraryFileType.toString()
    //   );
    // } else if (courseId) {
    //   condition += "AND l.course_id = $2";
    //   valuesForFilter.push(parseInt(courseId.toString()));
    // } else if (libraryFileType) {
    //   condition += "AND l.library_file_type = $2";
    //   valuesForFilter.push(libraryFileType.toString());
    // } else {
    //   condition += "";
    //   valuesForFilter.length = 0;
    // }

    // const sql = `
    //   SELECT

    //   l.library_id,
    //   l.library_file_name,
    //   l.library_file_type,
    //   l.created_at,
    //   -- l.library_file_link,
    //   -- SUBSTRING(l.library_file_link FROM 'https?://[^/]+(/.*)') AS file_name,
    //   -- SUBSTRING(l.library_file_link FROM '([^/]+)$') AS file_name,
    //   CASE WHEN l.library_file_type <> 'link' THEN SUBSTRING(l.library_file_link FROM '([^/]+)$') ELSE l.library_file_link END AS library_file_link,
    //   l.course_id

    //   FROM library AS l

    //   LEFT JOIN enrolled_batches_courses AS ebc
    //         ON ebc.student_id = $1
    //   LEFT JOIN payments AS p
    //         ON p.batch_id = ebc.batch_id AND p.student_id = $1
    //   LEFT JOIN course_batches AS cb
    //         ON cb.batch_id = ebc.batch_id

    //   WHERE l.is_active = true AND ebc.course_id = l.course_id ${condition}

    //   GROUP BY l.library_id, cb.batch_fee

    //   HAVING cb.batch_fee - SUM(p.paid_amount) = 0
    // `;
    // const { rows } = await pool.query(sql, [studentId, ...valuesForFilter]);
  }
);

export const getLibraryInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(`
        SELECT
        l.*
        FROM library AS l

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id AND l.visibility = 'subject-specific'

        -- LEFT JOIN subjects AS s
        -- ON s.subject_id = lws.subject_id 

        LEFT JOIN library_with_course AS lwc
        ON lwc.library_id = l.library_id AND l.visibility = 'course-specific'

        -- LEFT JOIN courses AS c
        -- ON c.course_id = lwc.course_id

        GROUP BY l.library_id
    `);
    res.status(200).json(new ApiResponse(200, "Done", rows));
  }
);

export const getSingleLibraryInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getSingleLibraryValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    // const { rows, rowCount } = await pool.query(
    //   `
    //       SELECT

    //       l.*,
    //       COALESCE(JSON_AGG(s) FILTER (WHERE s.subject_id IS NOT NULL), '[]'::json) AS subjects,
    //       COALESCE(JSON_AGG(
    //           JSON_OBJECT(
    //           'course_id' : c.course_id,
    //           'course_name' : c.course_name
    //           )
    //         ) FILTER (WHERE c.course_id IS NOT NULL), '[]'::json) AS courses

    //       FROM library AS l

    //       LEFT JOIN library_with_subject AS lws
    //       ON lws.library_id = l.library_id AND l.visibility = 'subject-specific'

    //       LEFT JOIN subjects AS s
    //       ON s.subject_id = lws.subject_id

    //       LEFT JOIN library_with_course AS lwc
    //       ON lwc.library_id = l.library_id AND l.visibility = 'course-specific'

    //       LEFT JOIN courses AS c
    //       ON c.course_id = lwc.course_id

    //       WHERE l.library_id = $1

    //       GROUP BY l.library_id

    //   `,
    //   [req.params.library_id]
    // );

    const { rows, rowCount } = await pool.query(
      `
          SELECT

          l.*,
          COALESCE(JSON_AGG(lws.subject_id) FILTER (WHERE lws.library_id IS NOT NULL), '[]'::json) AS subject_ids,
          COALESCE(JSON_AGG(lwc.course_id) FILTER (WHERE lwc.library_id IS NOT NULL), '[]'::json) AS course_ids

          FROM library AS l
          
          LEFT JOIN library_with_subject AS lws
          ON lws.library_id = l.library_id AND l.visibility = 'subject-specific'

          LEFT JOIN library_with_course AS lwc
          ON lwc.library_id = l.library_id AND l.visibility = 'course-specific'

          WHERE l.library_id = $1

          GROUP BY l.library_id
  
      `,
      [req.params.library_id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Done", rowCount === 0 ? null : rows[0]));
  }
);

export const insertNewItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = insertLibraryItemValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const courseIdsArray = (req.body.course_ids as string | undefined)?.split(
      ","
    );
    const subjectIdsArray = (req.body.subject_ids as string | undefined)?.split(
      ","
    );
    delete req.body.course_ids;
    delete req.body.subject_ids;

    const client = await pool.connect();

    const { error: transactionError } = await tryCatch(async () => {
      await client.query("BEGIN");

      //store into library first
      const { columns, params, values } = objectToSqlInsert(req.body);
      const { rows } = await client.query(
        `INSERT INTO library ${columns} VALUES ${params} RETURNING library_id`,
        values
      );

      const libraryID = rows[0].library_id;

      if (courseIdsArray) {
        const valuesToStore: string[] = [];
        courseIdsArray.forEach((item) => {
          valuesToStore.push(libraryID, item);
        });
        await client.query(
          `
          INSERT INTO library_with_course (library_id, course_id)
          VALUES ${sqlPlaceholderCreator(2, courseIdsArray.length).placeholder}
        `,
          valuesToStore
        );
      }

      if (subjectIdsArray) {
        const valuesToStore: string[] = [];
        subjectIdsArray.forEach((item) => {
          valuesToStore.push(libraryID, item);
        });
        await client.query(
          `
          INSERT INTO library_with_subject (library_id, subject_id)
          VALUES ${sqlPlaceholderCreator(2, subjectIdsArray.length).placeholder}
        `,
          valuesToStore
        );
      }

      await client.query("COMMIT");
      client.release();
    });

    if (transactionError !== null) {
      await client.query("ROLLBACK");
      client.release();
      throw transactionError;
    }

    res.status(201).json(new ApiResponse(201, "New Library Item Has Added"));
  }
);

export const updateLibraryItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateLibraryItemValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const libraryID = req.params.library_id;
    const courseIdsArray = (req.body.course_ids as string | undefined)?.split(
      ","
    );
    const subjectIdsArray = (req.body.subject_ids as string | undefined)?.split(
      ","
    );
    delete req.body.course_ids;
    delete req.body.subject_ids;
    delete req.body.library_id;

    const client = await pool.connect();

    const { error: transactionError } = await tryCatch(async () => {
      await client.query("BEGIN");

      //update library first
      const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
      values.push(libraryID);
      await pool.query(
        `UPDATE library SET ${keys} WHERE library_id = $${paramsNum}`,
        values
      );

      if (courseIdsArray) {
        //delete old items first
        await client.query(
          `DELETE FROM library_with_course WHERE library_id = $1`,
          [libraryID]
        );

        //the insert new items
        const valuesToStore: string[] = [];
        courseIdsArray.forEach((item) => {
          valuesToStore.push(libraryID, item);
        });
        await client.query(
          `
          INSERT INTO library_with_course (library_id, course_id)
          VALUES ${sqlPlaceholderCreator(2, courseIdsArray.length).placeholder}
        `,
          valuesToStore
        );
      }

      if (subjectIdsArray) {
        //delete old items first
        await client.query(
          `DELETE FROM library_with_subject WHERE library_id = $1`,
          [libraryID]
        );
        const valuesToStore: string[] = [];
        subjectIdsArray.forEach((item) => {
          valuesToStore.push(libraryID, item);
        });
        await client.query(
          `
          INSERT INTO library_with_subject (library_id, subject_id)
          VALUES ${sqlPlaceholderCreator(2, subjectIdsArray.length).placeholder}
        `,
          valuesToStore
        );
      }

      await client.query("COMMIT");
      client.release();
    });

    if (transactionError !== null) {
      await client.query("ROLLBACK");
      client.release();
      throw transactionError;
    }

    res.status(200).json(new ApiResponse(200, "Library Item Has Updated"));
  }
);

export const getLibraryInfoWithFilter = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise(resolve => setTimeout(() => resolve(""), 3000))
    const { error, value } = getLibraryInfoWithFilterValidator.validate(
      req.query
    );
    if (error) throw new ErrorHandler(400, error.message);

    const courseID = value.course_id;
    const subjectID = value.subject_id;

    const { rows } = await pool.query(
      `
        SELECT
        l.*
        FROM library AS l

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id AND l.visibility = 'subject-specific'

        LEFT JOIN library_with_course AS lwc
        ON lwc.library_id = l.library_id AND l.visibility = 'course-specific'

        WHERE ${
          courseID ? "lwc.course_id = $1" : "lws.subject_id = $1"
        } AND l.created_at BETWEEN $2 AND $3 AND institute = $4

        GROUP BY l.library_id
    `,
      [courseID ?? subjectID, value.date_from, value.date_to, value.institute]
    );

    res.status(200).json(new ApiResponse(200, "Done", rows));
  }
);

export const updateVisibility = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateVisibilityValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE library SET is_active = $1 WHERE library_id = $2`,
      [Boolean(value.is_active), value.library_id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Library Visibility Status Has Updated"));
  }
);
