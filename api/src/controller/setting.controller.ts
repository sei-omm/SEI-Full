import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { filterToSql } from "../utils/filterToSql";
import { parsePagination } from "../utils/parsePagination";
import {
  VAssignNewMember,
  VChangeRole,
  VDeleteMember,
  VUpdateMemberPermission,
} from "../validator/settings.validator";

export const assignNewMember = asyncErrorHandler(async (req, res) => {
  const { error, value } = VAssignNewMember.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const { rowCount } = await pool.query(
    `
         INSERT INTO members (employee_id, permissions) VALUES ($1, $2)
         ON CONFLICT (employee_id) DO NOTHING
         RETURNING employee_id
        `,
    [value.employee_id, value.permissions]
  );

  if (!rowCount || rowCount === 0)
    throw new ErrorHandler(
      400,
      "Employee has already been assigned as a member."
    );

  res.status(200).json(new ApiResponse(200, "New Member assigned"));
});

export const deleteSingleMember = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDeleteMember.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const { rowCount } = await pool.query(
    `
    DELETE FROM members m 
    USING employee e 
    WHERE m.employee_id = e.id 
    AND m.member_row_id = $1 
    AND e.employee_role != 'Super Admin' 
    RETURNING m.employee_id;
    `, [
    value.member_id,
  ]);

  if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "You can't remove super admin");

  res
    .status(200)
    .json(new ApiResponse(200, "Member has been successfully removed."));
});

export const updateSingleMemberPermissions = asyncErrorHandler(
  async (req, res) => {
    const { error, value } = VUpdateMemberPermission.validate({
      ...req.params,
      ...req.body,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { rowCount } = await pool.query(
      `
      UPDATE members m 
      SET permissions = $1 
      FROM employee e 
      WHERE e.id = m.employee_id 
      AND m.member_row_id = $2 
      AND e.employee_role != 'Super Admin' 
      RETURNING m.employee_id;
      `,
      [value.permissions, value.member_id]
    );

    if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "You can't change permissions of super admin");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Member permissions have been successfully updated."
        )
      );
  }
);

export const getMembers = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const { filterQuery, filterValues } = filterToSql(req.query, "e");

  const { rows } = await pool.query(
    `
    SELECT 
      e.name,
      e.login_email as employee_login_id,
      e.profile_image,
      e.employee_role,
      m.member_row_id as member_id,
      m.employee_id
    FROM members m

    LEFT JOIN employee e
    ON e.id = m.employee_id

    ${filterQuery}

    ORDER BY m.member_row_id DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    filterValues
  );

  res.status(200).json(new ApiResponse(200, "Members", rows));
});

export const getSingleMemberInfo = asyncErrorHandler(async (req, res) => {
  const { member_id } = req.params;

  const {rowCount, rows } = await pool.query(
    `SELECT * FROM members WHERE member_row_id = $1`,
    [member_id]
  );

  if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "No member found with the given ID");

  res.status(200).json(new ApiResponse(200, "Single Member Info", rows[0]));
});

export const changeMemberRole = asyncErrorHandler(async (req, res) => {
  const { error, value } = VChangeRole.validate({ ...req.params, ...req.body });
  if (error) throw new ErrorHandler(400, error.message);

  const { rowCount } = await pool.query(`UPDATE employee SET employee_role = $1 WHERE id = $2 AND employee_role != 'Super Admin' RETURNING id`, [
    value.role,
    value.employee_id,
  ]);

  if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "You can't change super admin role and permissions");

  res
    .status(200)
    .json(
      new ApiResponse(200, "The member's role has been changed successfully.")
    );
});
