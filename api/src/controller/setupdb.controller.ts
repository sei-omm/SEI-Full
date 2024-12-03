import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { pool } from "../config/db";

export const setupDB = asyncErrorHandler(
  async (req: Request, res: Response) => {
    let sql = ``;

    // //create department table
    // sql = `
    //     CREATE TABLE department (
    //         id SERIAL PRIMARY KEY,
    //         name VARCHAR(255) NOT NULL
    //     );
    // `;

    // await pool.query(sql);

    // //create employee table
    // sql = `
    //     CREATE TABLE employee (
    //         id SERIAL PRIMARY KEY,
    //         name VARCHAR(255) NOT NULL,
    //         employee_id VARCHAR(7),
    //         joining_date DATE,
    //         contact_number VARCHAR(15),
    //         email_address VARCHAR(255),
    //         living_address TEXT,
    //         dob DATE,
    //         gender CHAR(1),
    //         bank_name VARCHAR(100),
    //         bank_account_no VARCHAR(20),
    //         account_holder_name VARCHAR(100),
    //         ifsc_code CHAR(11),
    //         profile_url VARCHAR(2083),
    //         resume VARCHAR(2083),
    //         pan_card VARCHAR(2083),
    //         aadhaar_card VARCHAR(2083),
    //         10th_pass_certificate VARCHAR(2083),
    //         12th_pass_certificate VARCHAR(2083),
    //         graduation_certificate VARCHAR(2083),
    //         salary DECIMAL(10, 2),
    //         hra DECIMAL(10, 2),
    //         other_allowances DECIMAL(10, 2),
    //         provident_fund DECIMAL(10, 2),
    //         professional_tax DECIMAL(10, 2),
    //         is_active BOOLEAN NOT NULL DEFAULT true
    //     )
    // `;

    // await pool.query(sql);

    //create leave table
    // // CREATE TYPE leave_status_enum AS ENUM ('pending', 'success', 'decline');
    // sql = `
    //   CREATE TYPE leave_status_enum AS ENUM ('pending', 'success', 'decline');
    //   CREATE TABLE leave (
    //       id SERIAL PRIMARY KEY,
    //       employee_id INTEGER NOT NULL,
    //       leave_from DATE NOT NULL,
    //       leave_to DATE NOT NULL,
    //       leave_reason TEXT NOT NULL,
    //       leave_status leave_status_enum NOT NULL DEFAULT 'pending',
    //       FOREIGN KEY (employee_id) REFERENCES employee(id)
    //   )
    // `;
    // await pool.query(sql);

    sql = `
      CREATE TABLE job (
        id SERIAL PRIMARY KEY,
        job_title VARCHAR(250) NOT NULL,
        address TEXT NOT NULL,
        exprience VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL
    )
    `;
    await pool.query(sql);

    res.status(200).json(new ApiResponse(200, "DB Setup Complete"));
  }
);
