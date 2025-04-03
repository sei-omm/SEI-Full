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
import { holidayRoutes } from "./route/holiday.routes";
import { tranningRoutes } from "./route/tranning.routes";
import { cronRouter } from "./route/cron.routes";
import { websiteRoute } from "./route/website.routes";
import { settingRoute } from "./route/setting.routes";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { checkPermission } from "./middleware/checkPermission";
import { accountRoute } from "./route/account.routes";
import { sendOtp } from "./utils/SendSms";
import asyncErrorHandler from "./middleware/asyncErrorHandler";
import { pool } from "./config/db";
import { inventoryRoutesV2 } from "./route/v2/inventory.routes";

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
  : ["http://localhost:3000", "http://localhost:3001"]; // Default to localhost:3000

app.use(
  cors({
    origin: ALLOWED_ORIGINS, // Frontend URL
    credentials: true, // Required for cookies
  })
);

app.get(
  "/otp",
  asyncErrorHandler(async (req, res) => {
    await sendOtp("+919382413005");
    res.send("Send");
  })
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || ALLOWED_ORIGINS.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     // exposedHeaders: ["Content-Disposition", "Content-Type"],
//     credentials: true, // Required to send cookies
//   })
// );

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
app.use("/api/v1/storage", isAuthenticated, checkPermission, storageRouter);
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/receipt", receiptRoutes);
app.use("/api/v1/holiday", isAuthenticated, checkPermission, holidayRoutes);
app.use("/api/v1/tranning", isAuthenticated, checkPermission, tranningRoutes);
app.use("/api/v1/cron-job", cronRouter);
app.use("/api/v1/website", websiteRoute);
app.use("/api/v1/setting", isAuthenticated, checkPermission, settingRoute);
app.use("/api/v1/db", setupDbRoute);
app.use("/api/v1/account", accountRoute);

//v2
app.use("/api/v2/inventory", inventoryRoutesV2);

//global error handler
app.use(globalErrorController);

app.get("/pg", async (req, res) => {
  await pool.query(
    `
      INSERT INTO inventory_daily_report (
          item_id, item_name, category, sub_category, where_to_use, used_by, description, 
          minimum_quantity, current_status, vendor_id, institute, created_at, closing_stock, 
          opening_stock, item_consumed, total_value, cost_per_unit_current, cost_per_unit_previous, 
          current_purchase_date, report_date
      )
      SELECT 
          item_id, item_name, category, sub_category, where_to_use, used_by, description, 
          minimum_quantity, current_status, vendor_id, institute, created_at, closing_stock, 
          opening_stock, item_consumed, total_value, cost_per_unit_current, cost_per_unit_previous, 
          current_purchase_date, NOW() - INTERVAL '1 day'
      FROM inventory_item_info;
    `
  );

  res.send("DONE DONE");
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
