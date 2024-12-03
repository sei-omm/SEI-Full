import { pool } from "../config/db";
import { ErrorHandler } from "../utils/ErrorHandler";
import { objectToSqlConverterUpdate } from "../utils/objectToSql";

const table_name = "students";

export const fillUpForm = async (reqBody: object, studentId: number) => {
  const { keys, paramsNum, values } = objectToSqlConverterUpdate(reqBody);
  try {
    await pool.query(
      `UPDATE ${table_name} SET ${keys} WHERE student_id = $${paramsNum}`,
      [...values, studentId]
    );
  } catch (error) {
    throw new ErrorHandler(500, (error as any).message);
  }

  return true;
};
