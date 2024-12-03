import express, { Request, Response } from "express";
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
import { createToken } from "./utils/token";
import { paymentRouter } from "./route/payment.route";
import { pool } from "./config/db";
import { admissionRouter } from "./route/admission.route";
import { reportRouter } from "./route/report.route";

// import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';


dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);
// app.use(express.urlencoded({ extended: true }));

//parent routes
app.use("/api/v1/hr", hrRouter);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/resource", resourceRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/admission", admissionRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/db", setupDbRoute);

app.get("/test", (req, res) => {
  //no expire token for testing
  const quantityToRemove = 1;
  pool.query(
    `UPDATE courses SET remain_seats = remain_seats - $1 WHERE course_id = $2 AND remain_seats >= $1`,
    [`${quantityToRemove}`, 1]
  );
});

// app.post("/api/upload-url", async (req: Request, res: Response) => {
//   console.log("Clicked")
//   const body = req.body as HandleUploadBody
//   // console.log(body.payload)
//   // console.log(body.type)
//   console.log(body)
//   try {
//       const response = await handleUpload({
//           body: req.body, // Request body from the client
//           request: req, // Pass the Express request object
//           onBeforeGenerateToken: async () => ({
//               allowedContentTypes: ["image/jpeg", "image/png"], // Restrict file types
//               token: process.env.BLOB_READ_WRITE_TOKEN as string, // Token from environment
//           }),
//           onUploadCompleted: async ({ blob, tokenPayload }) => {
//               console.log("Upload completed:", blob, tokenPayload);
//           },
//       });

//       res.status(200).json(response); // Return the upload URL to the client
//   } catch (error) {
//       console.error("Error generating upload URL:", error);
//       res.status(500).json({ error: (error as Error).message });
//   }
// });

//global error handler
app.use(globalErrorController);

//route error
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json(new ApiResponse(404, `Can't find ${req.originalUrl} on the server`));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
