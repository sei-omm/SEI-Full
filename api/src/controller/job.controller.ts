import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import {
  applyJobValidator,
  createJobValidator,
  deleteJobValidator,
  getCandidateJobApplicationValidator,
  getJobsValidator,
  trackJobApplicationValidator,
  updateCandidateApplicationStatusValidator,
  updateJobValidator,
} from "../validator/job.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";

const table_name = "job";

export const getAllJobs = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const {error, value} = getJobsValidator.validate(req.query);
    if(error) return res.status(200).json(new ApiResponse(200, "", []));

    const department = value.department;
    const queryValues: string[] = [];

    if (department) {
      queryValues.push(department.toString());
    }

    const { rows } = await pool.query(
      `
      SELECT 
       j.*,
       d.name AS department_name
      FROM ${table_name} AS j
      LEFT JOIN department AS d
        ON d.id = j.department
      ${department ? "WHERE d.id = $1" : ""}
    `,
      queryValues
    );
    res.status(200).json(new ApiResponse(200, "All Listed Jobs", rows));
  }
);

export const getAJob = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = deleteJobValidator.validate(req.params);

    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `SELECT * FROM ${table_name} WHERE id = $1`,
      [value.id]
    );

    res.status(200).json(new ApiResponse(200, "A Job Details", rows));
  }
);

export const postNewJob = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = createJobValidator.validate(req.body);

    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);

    await pool.query(
      `INSERT INTO ${table_name} ${columns} VALUES ${params}`, //RETURNING *
      values
    );

    res.status(200).json(new ApiResponse(200, "New Job Has Posted"));
  }
);

export const updateJobPosting = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateJobValidator.validate({
      ...req.body,
      ...req.params,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);

    await pool.query(
      `UPDATE ${table_name} SET ${keys} WHERE id = $${paramsNum}`,
      [...values, value.id]
    );

    res.status(200).json(new ApiResponse(200, "Job info has updated"));
  }
);

export const removeJobPosting = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = deleteJobValidator.validate(req.params);

    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM ${table_name} WHERE id = $1`, [
      req.params.id,
    ]);

    res.status(200).json(new ApiResponse(200, "Job removed successfully"));
  }
);

//candidate job application controllers
export const applyJobAsCandidate = asyncErrorHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ErrorHandler(400, "'resume' is required");
    }

    const { error, value } = applyJobValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);

    const bodyData = {
      ...value,
      resume: req.file.path.replace("\\", "/"),
      application_id: `SEI${uniqueNumber}`,
    };

    const { columns, params, values } = objectToSqlInsert(bodyData);

    const { rows } = await pool.query(
      `INSERT INTO candidate_job_application ${columns} VALUES ${params} RETURNING *`,
      values
    );

    res
      .status(201)
      .json(new ApiResponse(201, "Job Successfully Applied", rows));
  }
);

export const updateCandidateApplicationStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateCandidateApplicationStatusValidator.validate(
      {
        ...req.body,
        ...req.params,
      }
    );

    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE candidate_job_application SET application_status = $1 WHERE id = $2`,
      [value.application_status, value.application_list_id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Candidate Job Application Has Updated"));
  }
);

export const getCandidateJobApplication = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getCandidateJobApplicationValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `SELECT * FROM candidate_job_application WHERE job_id = $1`,
      [req.params.job_id]
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, "List Of Candidate Who Applied For This Job", rows)
      );
  }
);

export const trackJobApplication = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = trackJobApplicationValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `SELECT application_status FROM candidate_job_application WHERE application_id = $1`,
      [req.params.application_id]
    );

    res.status(200).json(new ApiResponse(200, "Job Application Status", rows));
  }
);
