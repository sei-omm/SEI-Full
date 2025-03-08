import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {
  downloadFileValidator,
  getLibraryInfoWithFilterValidator,
  getSingleLibraryValidator,
  insertLibraryItemValidator,
  insertPhysicalLibraryValidator,
  issueBookValidator,
  returnBookToLibraryBulkV,
  // returnBookToLibraryValidator,
  updateLibraryItemValidator,
  updatePhysicalLibraryValidator,
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
import { parsePagination } from "../utils/parsePagination";
// import { filterToSql } from "../utils/filterToSql";

export const streamBlobLibraryFileForStudnets = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const fileName = req.params.file_name;
    if (!fileName) throw new ErrorHandler(400, "file-name is required");

    // if (
    //   process.env.HOST_URL?.includes(req.headers.referer || "") ||
    //   req.headers.referer?.includes(process.env.HOST_URL || "")
    // ) {
    //   throw new ErrorHandler(400, "You are not able to access this resources");
    // }

    if(req.headers.origin !== process.env.FRONTEND_HOST) {
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
        const fileName = new URL(resourcesLink).pathname.split("/").pop();
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );
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
      student_id: res.locals.student_id,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const studentId = res.locals.student_id;
    const visibility = req.query.visibility;
    const itemId = req.query.item_id;

    if (visibility === "subject-specific") {
      const { rows } = await pool.query(
        `
        SELECT 
        l.*,
        STRING_AGG(s.subject_name, ', ') AS subject_names
        FROM library AS l

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id

        LEFT JOIN subjects s
        ON s.subject_id = lws.subject_id

        WHERE lws.subject_id = $1

        GROUP BY l.library_id
      `,
        [itemId]
      );

      return res.status(200).json(new ApiResponse(200, "", rows));
    }

    const sql = `
        SELECT 
          l.*,
          CASE WHEN l.library_file_type <> 'link' THEN SUBSTRING(l.library_resource_link FROM '([^/]+)$') ELSE l.library_resource_link END AS library_resource_link,
          COALESCE(STRING_AGG(DISTINCT c.course_name, ', '), STRING_AGG(DISTINCT s.subject_name, ', ')) AS course_name
        FROM library AS l

        LEFT JOIN library_with_course AS lwc
        ON lwc.library_id = l.library_id

        LEFT JOIN enrolled_batches_courses AS ebc
            ON ebc.student_id = $1

        LEFT JOIN course_batches AS cb
            ON cb.batch_id = ebc.batch_id

        LEFT JOIN courses AS c
        ON c.course_id = lwc.course_id

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id

        LEFT JOIN subjects AS s
        ON s.subject_id = lws.subject_id

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

    // const { rows } = await pool.query(
    //   `
    //   SELECT
    //     l.library_id,
    //     l.library_file_name,
    //     l.library_file_type,
    //     l.allow_download,
    //     CASE WHEN l.library_file_type <> 'link' THEN SUBSTRING(l.library_resource_link FROM '([^/]+)$') ELSE l.library_resource_link END AS library_resource_link,
    //     l.created_at
    //   FROM library l

    //   -- Library With Course
    //   LEFT JOIN library_with_course lwc
    //   ON lwc.library_id = l.library_id

    //   -- Library With Subject
    //   LEFT JOIN library_with_subject lws
    //   ON lws.library_id = l.library_id

    //   LEFT JOIN subjects s
    //   ON s.subject_id = lws.subject_id

    //   WHERE l.is_active = true
    //   `
    // );

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
    const { LIMIT, OFFSET } = parsePagination(req);

    let filterQuery = "WHERE";
    const filterValues : string[] = [];
    let placeHolderNum = 1;

    if(req.query.institute) {
      filterQuery += ` l.institute = $${placeHolderNum}`;
      filterValues.push(req.query.institute as string);
      placeHolderNum++;
    }

    if(req.query.visibility) {
      if(filterQuery === "WHERE") {
        filterQuery += ` l.visibility = $${placeHolderNum}`;
      } else {
        filterQuery += ` AND l.visibility = $${placeHolderNum}`;
      }
      filterValues.push(req.query.visibility as string);
      placeHolderNum++;
    }

    if(req.query.course_id) {
      if(filterQuery === "WHERE") {
        filterQuery += ` lwc.course_id = $${placeHolderNum}`;
      } else {
        filterQuery += ` AND lwc.course_id = $${placeHolderNum}`;
      }

      filterValues.push(req.query.course_id as string);
      placeHolderNum++;
    }

    if(req.query.subject_id) {
      if(filterQuery === "WHERE") {
        filterQuery += ` lws.subject_id = $${placeHolderNum}`;
      } else {
        filterQuery += ` AND lws.subject_id = $${placeHolderNum}`;
      }

      filterValues.push(req.query.subject_id as string);
      placeHolderNum++;
    }

    if(req.query.date_from && req.query.date_to) {
      if(filterQuery === "WHERE") {
        filterQuery += ` l.created_at BETWEEN $${placeHolderNum} AND $${placeHolderNum + 1}`;
      } else {
        filterQuery += ` AND l.created_at BETWEEN $${placeHolderNum} AND $${placeHolderNum + 1}`;
      }

      filterValues.push(req.query.date_from as string);
      filterValues.push(req.query.date_to as string);
      placeHolderNum++;
      placeHolderNum++;
    }

    if(filterQuery === "WHERE") {
      filterQuery = "";
    }

    const { rows } = await pool.query(`
        SELECT
        l.*,
        STRING_AGG(
          COALESCE(s.subject_name, c.course_name), ', '
        ) AS course_or_subject_name
        FROM library AS l

        LEFT JOIN library_with_subject AS lws
        ON lws.library_id = l.library_id AND l.visibility = 'subject-specific'

        LEFT JOIN subjects AS s
        ON s.subject_id = lws.subject_id 

        LEFT JOIN library_with_course AS lwc
        ON lwc.library_id = l.library_id AND l.visibility = 'course-specific'

        LEFT JOIN courses AS c
        ON c.course_id = lwc.course_id

        ${filterQuery}

        GROUP BY l.library_id

        LIMIT ${LIMIT} OFFSET ${OFFSET}
    `, filterValues);

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
    const { error, value } = getLibraryInfoWithFilterValidator.validate(
      req.query
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { LIMIT, OFFSET } = parsePagination(req);

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

        LIMIT ${LIMIT} OFFSET ${OFFSET}
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

// Physical Library

export const addPhyLibBooks = asyncErrorHandler(async (req, res) => {
  const { error, value } = insertPhysicalLibraryValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `
    INSERT INTO phy_lib_books 
      (book_name, edition, author, row_number, shelf, institute)
    VALUES
      ${sqlPlaceholderCreator(6, value.length).placeholder}
    `,
    value.flatMap((item) => [
      item.book_name,
      item.edition,
      item.author,
      item.row_number,
      item.shelf,
      item.institute,
    ])
  );

  res.status(201).json(new ApiResponse(201, "Books Are Added"));
});

export const updatePhyLibBooks = asyncErrorHandler(async (req, res) => {
  const { error, value } = updatePhysicalLibraryValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const placeholders = value
    .map(
      (_, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${
          i * 6 + 5
        }, $${i * 6 + 6})`
    )
    .join(", ");

  await pool.query(
    `
    UPDATE phy_lib_books AS p
      SET 
        book_name = v.book_name, 
        edition = v.edition, 
        author = v.author, 
        row_number = v.row_number::INTEGER, 
        shelf = v.shelf
      FROM (VALUES 
        ${placeholders}
      ) AS v(phy_lib_book_id, book_name, edition, author, row_number, shelf)
      WHERE p.phy_lib_book_id = v.phy_lib_book_id::INTEGER;
    `,

    value.flatMap((book) => [
      book.phy_lib_book_id,
      book.book_name,
      book.edition,
      book.author,
      book.row_number,
      book.shelf,
    ])
  );
  res.status(200).json(new ApiResponse(200, "Book Info Successfully Updated"));
});

export const issueBooksToStudent = asyncErrorHandler(async (req, res) => {
  const { error, value } = issueBookValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `
    INSERT INTO 
        phy_lib_book_issue (student_id, employee_id, course_id, phy_lib_book_id, issue_date, institute)
    VALUES
        ${sqlPlaceholderCreator(6, value.info.length).placeholder}
    `,
    value.info.flatMap((item: any) => [
      value.student_id || null,
      value.employee_id || null,
      item.course_id || null,
      item.phy_lib_book_id,
      value.issue_date,
      value.institute,
    ])
  );

  res.status(200).json(new ApiResponse(200, "Books Successfully Issued"));
});

export const returnBookBulk = asyncErrorHandler(async (req, res) => {
  const { error, value } = returnBookToLibraryBulkV.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const placeholder = value
    .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
    .join(", ");

  await pool.query(
    `
  UPDATE phy_lib_book_issue plbi
  SET return_date = u.return_date::DATE
  FROM (VALUES ${placeholder}) AS u(phy_lib_book_issue_id, return_date)
  WHERE plbi.phy_lib_book_issue_id = u.phy_lib_book_issue_id::INTEGER
  `,
    value.flatMap((item) => [item.phy_lib_book_issue_id, item.return_date])
  );

  res.status(200).json(new ApiResponse(200, "Books Successfully Received."));
});

export const getPhysicalLibBooks = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const { book_name, institute } = req.query;

  let filter = "WHERE";
  const filterValues: any[] = [];
  let placeholdernum = 1;

  if (book_name) {
    filter += ` book_name ILIKE '%' || $${placeholdernum} || '%'`;
    filterValues.push(book_name);
    placeholdernum++;
  }

  if (institute) {
    if (filter === "WHERE") {
      filter += ` institute = $${placeholdernum}`;
    } else {
      filter += ` AND institute = $${placeholdernum}`;
    }
    placeholdernum++;
    filterValues.push(institute);
  }

  if (filter === "WHERE") {
    filter = "";
  }

  const { rows } = await pool.query(
    `
      SELECT * FROM phy_lib_books
      ${filter}
      ORDER BY phy_lib_books DESC
      LIMIT ${LIMIT} OFFSET ${OFFSET}`,
    filterValues
  );

  res.status(200).json(new ApiResponse(200, "Books List", rows));
});

export const getBookIssueList = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const { institute, from_date, to_date, search_by, search_keyword } = req.query;

  let filter = "WHERE";
  const filterValues: string[] = [];
  let placeholdernum = 1;

  //these are for filtering -- START
  if (institute) {
    filter += ` plbi.institute = $${placeholdernum}`;
    placeholdernum++;
    filterValues.push(institute as string);
  }

  if (from_date && to_date) {
    const search_by = req.query.search_by === "received_date" ? "return_date" : "issue_date";

    if (filter === "WHERE") {
      filter += ` plbi.${search_by} BETWEEN $${placeholdernum}`;
      placeholdernum++;
      filter += ` AND $${placeholdernum}`;
    } else {
      filter += ` AND plbi.${search_by} BETWEEN $${placeholdernum}`;
      placeholdernum++;
      filter += ` AND $${placeholdernum}`;
    }
    placeholdernum++;
    filterValues.push(from_date as string);
    filterValues.push(to_date as string);
  }
  //these are for filtering -- END

  //these are for searching -- START
  if (
    search_by &&
    search_keyword &&
    search_by === "indos_number" &&
    institute
  ) {
    placeholdernum = 1;
    filterValues.length = 0;
    filter = `WHERE s.indos_number = $${placeholdernum} AND plbi.institute = $${
      placeholdernum + 1
    }`;
    filterValues.push(search_keyword as string);
    filterValues.push(institute as string);
  }

  if (search_by && search_keyword && search_by === "course_name" && institute) {
    placeholdernum = 1;
    filterValues.length = 0;
    filter = `WHERE c.course_name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
      placeholdernum + 1
    }`;
    filterValues.push(search_keyword as string);
    filterValues.push(institute as string);
  }

  if (
    search_by &&
    search_keyword &&
    search_by === "student_name" &&
    institute
  ) {
    placeholdernum = 1;
    filterValues.length = 0;
    filter = `WHERE s.name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
      placeholdernum + 1
    }`;
    filterValues.push(search_keyword as string);
    filterValues.push(institute as string);
  }

  if (
    search_by &&
    search_keyword &&
    search_by === "faculty_name" &&
    institute
  ) {
    placeholdernum = 1;
    filterValues.length = 0;
    filter = `WHERE e.name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
      placeholdernum + 1
    }`;
    filterValues.push(search_keyword as string);
    filterValues.push(institute as string);
  }

  if (search_by && search_keyword && search_by === "book_name" && institute) {
    placeholdernum = 1;
    filterValues.length = 0;
    filter = `WHERE plb.book_name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
      placeholdernum + 1
    }`;
    filterValues.push(search_keyword as string);
    filterValues.push(institute as string);
  }
  //these are for searching -- END

  if (filter === "WHERE") filter = "";

  const { rows } = await pool.query(
    `
    SELECT
      plbi.phy_lib_book_issue_id,
      COALESCE(s.name, e.name) AS student_name,
      s.indos_number,
      c.course_name,
      plb.book_name,
      plb.edition,
      plbi.issue_date,
      plbi.return_date
    FROM phy_lib_book_issue plbi

    LEFT JOIN students s
    ON s.student_id = plbi.student_id

    LEFT JOIN courses c
    ON c.course_id = plbi.course_id

    LEFT JOIN employee e
    ON e.id = plbi.employee_id

    LEFT JOIN phy_lib_books plb
    ON plb.phy_lib_book_id = plbi.phy_lib_book_id

    ${filter}

    ORDER BY plbi.issue_date DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    filterValues
  );

  res.status(200).json(new ApiResponse(200, "Book Issue List", rows));
});
