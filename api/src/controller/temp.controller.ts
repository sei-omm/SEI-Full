import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { VTimeTable } from "../validator/course.validator";

interface IResult {
    course_id : number;
    course_name : string;
    course_code : string;
    subjects : string[];
    faculty_and_subject : {
      subject : string;
      faculties : {
        faculty_name : string;
        profile_image : string;
        faculty_id : number;
      }[]
    }[]
  }
  
  export const generateTimeTableV2 = asyncErrorHandler(async (req, res) => {
    const { error, value } = VTimeTable.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);
  
    const cDate = new Date(value.date);
    if (cDate.getDay() === 0) {
      throw new ErrorHandler(
        405,
        `You can't prepare time table as it is "Sunday"`
      );
    }
  
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      const { rowCount, rows: holidayInfo } = await client.query(
        `SELECT holiday_name FROM holiday_management WHERE holiday_date = $1 AND institute = $2`,
        [value.date, value.institute]
      );
  
      if (rowCount !== 0)
        throw new ErrorHandler(
          405,
          `You can't prepare time table as it is Holiday "${holidayInfo[0].holiday_name}"`
        );
  
      const { rows: dreftData, rowCount: dreftCount } = await client.query(
        `SELECT * FROM time_table_draft WHERE date = $1`,
        [value.date]
      );
      if (dreftCount !== 0) {
        return res.status(200).json(
          new ApiResponse(200, "Time Table Info", {
            type: "draft",
            result: dreftData[0],
          })
        );
      }
  
      const { rows } = await client.query(
        `
              SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.subjects,
                COALESCE(
                    (
                        SELECT json_agg(
                            jsonb_build_object(
                                'faculty_id', fwcs.faculty_id,
                                'subject', fwcs.subject,
                                'faculty_name', e.name,
                                'profile_image', e.profile_image,
                                'max_teaching_hrs_per_week', CASE WHEN e.max_teaching_hrs_per_week = '' THEN '0' ELSE e.max_teaching_hrs_per_week END,
                                'faculty_current_working_hours', e.faculty_current_working_hours,
                                'is_active', e.is_active
                            )
                        )
                        FROM faculty_with_course_subject fwcs
                        INNER JOIN employee e ON e.id = fwcs.faculty_id
                        WHERE fwcs.course_id = c.course_id AND e.is_active = true
                    ),
                    '[]'::json
                ) AS faculty_details
              FROM courses c
              INNER JOIN course_batches cb ON cb.course_id = c.course_id
                
              WHERE c.institute = $1 AND $2 BETWEEN cb.start_date AND cb.end_date
      
              GROUP BY c.course_id
          `,
        [value.institute, value.date]
      );
  
      const outputs = rows as InfoType[];
      const result : IResult[] = [];
  
      outputs.forEach(output => {
  
        // list of course subjects
        const subjects = output.subjects.split(",");
  
        const tempInfo : IResult = {
          course_code : output.course_code,
          course_id : output.course_id,
          course_name : output.course_name,
          subjects : subjects,
          faculty_and_subject : []
        }
  
        subjects.forEach(cSubject => {
  
          //filter facuilties who teach the current subject
          const tempFaculty = output.faculty_details.filter(cFac => cFac.subject.includes(cSubject)).map(item => ({
            faculty_id : item.faculty_id,
            faculty_name : item.faculty_name,
            profile_image : item.profile_image,
          }));
  
          tempInfo.faculty_and_subject.push({
            subject : cSubject,
            faculties : tempFaculty
          })
  
        })
  
        result.push(tempInfo)
      })
  
      res.status(200).json(
        new ApiResponse(200, "Time Table Info", {
          type: "generated",
          result: result,
        })
      );
  
      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      if (error?.isOperational) {
        throw new ErrorHandler(error.statusCode, error.message);
      } else {
        throw new ErrorHandler(500, error.message);
      }
    }
  });