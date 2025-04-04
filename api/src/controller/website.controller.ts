import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { parsePagination } from "../utils/parsePagination";
import {
  VAddNewNotice,
  VDeleteSingleNotice,
  VPostNewBlog,
  VSingleBlog,
  VUpdateSingleBlog,
  VUpdateSingleNotice,
} from "../validator/website.validator";

export const addNewNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VAddNewNotice.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `INSERT INTO notice (heading, description, visible) VALUES ($1, $2, $3)`,
    [value.heading, value.description, value.visible]
  );

  res.status(201).json(new ApiResponse(201, "New notice added"));
});

export const updateSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VUpdateSingleNotice.validate({
    ...req.params,
    ...req.body,
  });
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `UPDATE notice SET heading = $1, description = $2, visible = $3 WHERE notice_id = $4`,
    [value.heading, value.description, value.visible, value.notice_id]
  );

  res.status(200).json(new ApiResponse(200, "Notice Successfully Updated"));
});

export const deleteSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDeleteSingleNotice.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(`DELETE FROM notice WHERE notice_id = $1`, [
    value.notice_id,
  ]);

  res.status(200).json(new ApiResponse(200, "Notice Removed"));
});

export const getSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDeleteSingleNotice.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows, rowCount } = await pool.query(
    `SELECT * FROM notice WHERE notice_id = $1`,
    [value.notice_id]
  );

  if (!rowCount || rowCount === 0) {
    throw new ErrorHandler(400, "No Notice Avilable With This notice id");
  }

  res.status(200).json(new ApiResponse(200, "Single Notice Info", rows[0]));
});

export const getAllNotice = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const forWhome = req.query.for || "frontend";

  const { rows } = await pool.query(
    `
    SELECT * FROM notice

    ${forWhome === "crm" ? "" : "WHERE visible = true"}

    ORDER BY notice_id DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `
  );

  res.status(200).json(new ApiResponse(200, "All Notice", rows));
});

// blogs

export const getBlogsList = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
      SELECT 
        blog_id, 
        heading, 
        meta_description, 
        meta_keywords, 
        created_at,
        thumbnail,
        visible,
        thumbnail_alt_tag,
        slug
      FROM blogs
      ORDER BY blog_id DESC
      LIMIT ${LIMIT} OFFSET ${OFFSET}
      `
  );

  res.status(200).json(new ApiResponse(200, "Blogs List", rows));
});

export const getSingleBlog = asyncErrorHandler(async (req, res) => {
  const { error, value } = VSingleBlog.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const search_with = Number.isNaN(parseInt(value.blog_id)) ? "slug" : "blog_id"

  const { rowCount, rows } = await pool.query(
    `SELECT * FROM blogs WHERE ${search_with} = $1`,
    [value.blog_id]
  );
  if (!rowCount || rowCount === 0)
    throw new ErrorHandler(400, "No blog found with this id");

  res.status(200).json(new ApiResponse(200, "Single Blog Info", rows[0]));
});

export const postNewBlog = asyncErrorHandler(async (req, res) => {
  const { error, value } = VPostNewBlog.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const { params, values, columns } = objectToSqlInsert(value);

  const { rowCount } = await pool.query(
    `
      INSERT INTO blogs ${columns} VALUES ${params}
      ON CONFLICT (slug) DO NOTHING
      RETURNING blog_id
    `,
    values
  );

  if (!rowCount || rowCount === 0) {
    throw new ErrorHandler(400, "Duplicate Heading Please Change The Heading");
  }

  res.status(201).json(new ApiResponse(201, "New Blog Added"));
});

export const updateSingleBlog = asyncErrorHandler(async (req, res) => {
  const { error, value } = VUpdateSingleBlog.validate({
    ...req.body,
    ...req.params,
  });
  if (error) throw new ErrorHandler(400, error.message);

  const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
  values.push(value.blog_id);

  const { rowCount } = await pool.query(
    `
      UPDATE blogs SET ${keys} 
        WHERE 
          blog_id = $${paramsNum}
    `,
    values
  );

  if (!rowCount || rowCount === 0) {
    throw new ErrorHandler(400, "Duplicate Heading Please Change The Heading");
  }

  res.status(200).json(new ApiResponse(200, "Blog Updated"));
});

export const deleteBlog = asyncErrorHandler(async (req, res) => {
  const { error, value } = VSingleBlog.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(`DELETE FROM blogs WHERE blog_id = $1`, [value.blog_id]);

  res.status(200).json(new ApiResponse(200, "Blog Remove"));
});
