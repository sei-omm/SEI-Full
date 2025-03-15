export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const FLOW_OF_APPRAISAL = [
  "Employee",
  "Reporting Authority",
  "Review Authority",
];

export const TIME_PERIOD = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
];

export const AUTHORITY = ["SUPER ADMIN", "HOI", "HOD", "UDS", "LDS"];

export const inventoryCatList = [
  { category_id: 1, category_name: "Consumable" },
  { category_id: 2, category_name: "Durable" },
];

export const inventorySubCatList = [
  { sub_category_id: 1, sub_category_name: "Civil" },
  { sub_category_id: 2, sub_category_name: "Electrical" },
  { sub_category_id: 3, sub_category_name: "Furniture" },
  { sub_category_id: 4, sub_category_name: "LSA" },
  { sub_category_id: 5, sub_category_name: "FFA" },
  { sub_category_id: 6, sub_category_name: "Stationary" },
  { sub_category_id: 7, sub_category_name: "IT" },
  { sub_category_id: 8, sub_category_name: "Handouts" },
  { sub_category_id: 9, sub_category_name: "Ladhiyapur Store" },
];

export const PERMISSION_PATH_MAP: Record<string, string | string[]> = {
  "/employee/": "1-1",
  "/employee": "1-1",
  "/employee/assets" : "1-1",
  "/hr/dashboard": "1-1",
  "/employee/document" : "1-1",

  "/hr/department": "1-2",
  "/hr/attendance": "1-3",
  "/hr/attendance/export-sheet": "1-3",
  "/hr/leave": "1-4",
  "/hr/leave/other": "1-4",
  "/hr/leave/employees": "1-4",
  "/hr/leave/receipt": "1-4",
  "/hr/leave/add-earn-leave": "1-4",
  "/hr/leave/add-yearly-leave": "1-4",
  "/hr/job": "1-5",
  "/hr/job/apply": "1-5",

  "/storage": "1-6", //this is Compliance Record
  "/storage/folder": "1-6",
  "/storage/file": "1-6",
  "/folder": "1-6",
  "/file": "1-6",

  "/hr/payscale": "1-7",

  "/holiday": "1-8",

  "/employee/appraisal": "1-9",
  "/employee/appraisal/print": "1-9",

  "/tranning": "1-10",
  "/tranning/history": "1-10",
  "/tranning/employee": "1-10",
  "/tranning/one-form": "1-10",
  "/tranning/complete": "1-10",
  "/tranning/render-form": "1-10",

  "/setting" : "6-1",
  "/setting/member" : "6-1",
  "/setting/member/role" : "6-1"
};
