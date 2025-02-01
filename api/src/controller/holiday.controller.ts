import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { transaction } from "../utils/transaction";
import { VAddHolidayList } from "../validator/holiday.validator";

export const addHolidayList = asyncErrorHandler(async (req, res) => {
  const { error, value } = VAddHolidayList.validate(req.body);
  if (error)
    throw new ErrorHandler(400, error.message, error.details[0].context?.key);

  await transaction([
    {
      sql: "DELETE FROM holiday_management WHERE holiday_year = $1",
      values: [value[0].holiday_year],
    },
    {
      sql: `
        INSERT INTO holiday_management 
            (holiday_name, holiday_date, holiday_year)
        VALUES
            ${sqlPlaceholderCreator(3, value.length).placeholder}
        `,

      values: value.flatMap((item) => [
        item.holiday_name,
        new Date(item.holiday_date).toISOString().split('T')[0],
        item.holiday_year,
      ]),
    },
  ]);

  // const client = await pool.connect();

  // try {
  //   await client.query("BEGIN");

  //   const { rowCount } = await client.query(
  //     `SELECT holiday_year FROM holiday_management WHERE holiday_year = $1`,
  //     [value[0].holiday_year]
  //   );

  //   if (rowCount === 0) {
  //     //if no holiday year exist then insert
  //     await client.query(
  //       `
  //       INSERT INTO holiday_management
  //           (holiday_name, holiday_date, holiday_year)
  //       VALUES
  //           ${sqlPlaceholderCreator(3, value.length).placeholder}
  //       `,
  //       value.flatMap((item) => [
  //         item.holiday_name,
  //         item.holiday_date,
  //         item.holiday_year,
  //       ])
  //     );
  //   } else {

  //   }

  //   await client.query("COMMIT");
  //   client.release();
  // } catch {
  //   await client.query("ROLLBACK");
  //   client.release();
  // }

  res.status(201).json(new ApiResponse(201, "Holiday List Inserted"));
});
