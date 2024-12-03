import express from "express";
import { globalErrorController } from "./controller/error.controller";
import { ApiResponse } from "./utils/ApiResponse";
import { studentUploadRouter } from "./routes/student.upload.routes";
import dotenv from "dotenv";
import cors from "cors";
import { jobRoute } from "./routes/job.routes";

const app = express();

app.use(express.json());

dotenv.config();
app.use(
  cors({
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);

app.use("/api/v1/student", studentUploadRouter);
app.use("/api/v1/job", jobRoute);

//global error handler
app.use(globalErrorController);

//route error
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json(new ApiResponse(404, `Can't find ${req.originalUrl} on the server`));
});

const PORT = 8081;
app.listen(PORT, () => console.log("http://localhost:" + PORT));
