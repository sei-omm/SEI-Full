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
import { uploadRoute } from "./route/upload.routes";
import { libraryRouter } from "./route/library.routes";
import https from "https";
import { subjectRoute } from "./route/subject.routes";
import cookieParser from "cookie-parser";
import { storageRouter } from "./route/storage.routes";
import { inventoryRoute } from "./route/inventory.routes";

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
app.use(cookieParser())
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
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/subject", subjectRoute);
app.use("/api/v1/storage", storageRouter);
app.use("/api/v1/inventory", inventoryRoute)
app.use("/api/v1/db", setupDbRoute);

app.get("/stream-vercel-blob", async (req, res) => {
  // //no expire token for testing
  // const quantityToRemove = 1;
  // pool.query(
  //   `UPDATE courses SET remain_seats = remain_seats - $1 WHERE course_id = $2 AND remain_seats >= $1`,
  //   [`${quantityToRemove}`, 1]
  // );

  const vercelBlobUrl = "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/library-files/JOYITA%20KUNDU%20CV-bk65x4xuq9yJU6fXs8uq6cmXWXyYQ4.pdf";

  https.get(vercelBlobUrl, (blobRes) => {
    // Forward Content-Type header
    const contentType = blobRes.headers['content-type'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Forward Content-Length header if available
    const contentLength = blobRes.headers['content-length'];
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    } else {
      console.warn('Content-Length header is missing');
    }

    // Stream the response to the client
    blobRes.pipe(res);
  }).on('error', (err) => {
    console.error(err);
    res.status(500).send('Error streaming the file');
  });


});

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
