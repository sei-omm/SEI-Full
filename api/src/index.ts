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

dotenv.config();
const app = express();
const PORT = 8080;

console.log(path.resolve("/public/views"))

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.resolve("/public/views"));
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
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/receipt", receiptRoutes);
app.use("/api/v1/db", setupDbRoute);

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
