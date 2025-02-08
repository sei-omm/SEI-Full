import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { globalErrorController } from "./controller/error.controller";
import { ApiResponse } from "./utils/ApiResponse";
import { hrRouter } from "./route/hr.route";
import { setupDbRoute } from "./route/setupdb.route";
import { employeeRoute } from "./route/employee.route";
import { resourceRouter } from "./route/resource.route";
import { studentRouter } from "./route/student.route";
import { courseRouter } from "./route/course.route";
import { paymentRouter } from "./route/payment.route";
import { admissionRouter } from "./route/admission.route";
import { reportRouter } from "./route/report.route";
import { uploadRoute } from "./route/upload.routes";
import { libraryRouter } from "./route/library.routes";
import { subjectRoute } from "./route/subject.routes";
import cookieParser from "cookie-parser";
import { storageRouter } from "./route/storage.routes";
import { inventoryRoute } from "./route/inventory.routes";
import { notificationRoutes } from "./route/notification.routes";
import { receiptRoutes } from "./route/receipt.routes";
import path from "path";
import { pool } from "./config/db";
import { holidayRoutes } from "./route/holiday.routes";
import { tranningRoutes } from "./route/tranning.routes";

dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "../public/views"));
app.use(express.json());
app.use(cookieParser());
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
app.use(
  cors({
    exposedHeaders: ["Content-Disposition", "Content-Type"],
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

//parent routes
app.use("/api/v1/hr", hrRouter);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/resource", resourceRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/admission", admissionRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/subject", subjectRoute);
app.use("/api/v1/storage", storageRouter);
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/receipt", receiptRoutes);
app.use("/api/v1/holiday", holidayRoutes);
app.use("/api/v1/tranning", tranningRoutes)
app.use("/api/v1/db", setupDbRoute);

//global error handler
app.use(globalErrorController);

app.get("/some", async (req, res) => {
  const { rows } = await pool.query(`
              WITH payment_list AS (
                 SELECT
                  *
                 FROM payments p
                 WHERE p.form_id = $1
              )

              SELECT
              s.*,
              '********' AS password,
              ff.form_status,
              ff.form_id,

              json_agg(
                  json_build_object(
                      'enroll_id', ebc.enroll_id,
                      'course_id', c.course_id,
                      'course_require_documents', c.require_documents,
                      'course_name', c.course_name,
                      'batch_start_date', cb.start_date,
                      'batch_end_date', cb.end_date,
                      'batch_fee', cb.batch_fee,
                      'batch_id', cb.batch_id,
                      'enrollment_status', ebc.enrollment_status,
                      'modified_by_info', (
                          SELECT json_agg(
                              json_build_object('batch_id', mb.batch_id, 'employee_name', e.name, 'created_at', mb.created_at)
                          )
                          FROM batch_modified_by AS mb

                          INNER JOIN employee e
                          ON e.id = mb.employee_id

                          WHERE mb.batch_id = cb.batch_id
                          -- ORDER BY DESC
                      )
                  ) ORDER BY ebc.enroll_id
              ) AS enrolled_courses_info,
              
              json_agg(pl.*)


          FROM fillup_forms AS ff
          LEFT JOIN students AS s ON s.student_id = ff.student_id
          LEFT JOIN enrolled_batches_courses AS ebc ON ebc.form_id = ff.form_id
          LEFT JOIN courses AS c ON c.course_id = ebc.course_id
          LEFT JOIN course_batches AS cb ON cb.batch_id = ebc.batch_id

          LEFT JOIN payment_list pl

          WHERE ff.form_id = $1

          GROUP BY s.student_id, ff.form_status, ff.form_id;
  `, ['KOL/FORM/2025/47']);

  res.status(200).json(new ApiResponse(200, "", rows));
});

//route error
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json(new ApiResponse(404, `Can't find ${req.originalUrl} on the server`));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
