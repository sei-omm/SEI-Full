// export const BASE_API = "https://sei-api-zeta.vercel.app/api/v1";

import { TEmployeeDocs } from "@/types";

// export const BASE_API = "http://localhost:8080/api/v1";
export const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export const inventoryCatList = [
  { category_id: 1, category_name: "Consumable" },
  { category_id: 2, category_name: "Durable" },
];

export const inventoryCatKeyValue : Record<string, string> = {
  "1": "Consumable",
  "2": "Durable",
}

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

export const inventorySubCatKeyValue : Record<string, string> = {
  "1": "Civil",
  "2": "Electrical",
  "3": "Furniture",
  "4": "LSA",
  "5": "FFA",
  "6": "Stationary",
  "7": "IT",
  "8": "Handouts",
  "9": "Ladhiyapur Store",
}

export const inventoryItemStatuList = [
  { item_status_id: 1, item_status_name: "Repairable" },
  { item_status_id: 2, item_status_name: "Fully Damaged" },
  { item_status_id: 3, item_status_name: "Working" },
  { item_status_id: 4, item_status_name: "Damaged" },
];

export const paymentModes = [
  { id: 1, text: "CASH" },
  { id: 2, text: "ICICI BANK" },
  { id: 3, text: "CANARA BANK" },
  { id: 4, text: "SWIPE CARD" },
  { id: 5, text: "ONLINE" },
];

export const appraisalOptions = [
  {
    id: "option-1",
    text: "Accomplishment of planned work/work allotted as per subject allotted",
    group: 1,
  },
  { id: "option-2", text: "Quality of output", group: 1 },
  { id: "option-3", text: "Analytical ability", group: 1 },
  {
    id: "option-4",
    text: "Accomplishment of exceptional work / unforeseen tasks performed",
    group: 1,
  },
  { id: "option-5", text: "Overall grading on ‘work output’", group: 1 },

  { id: "option-6", text: "Attitude to work", group: 2 },
  { id: "option-7", text: "Sense of responsibility", group: 2 },
  { id: "option-8", text: "Maintenance of Discipline", group: 2 },
  { id: "option-9", text: "Communication skills", group: 2 },
  { id: "option-10", text: "Leadership Qualities", group: 2 },
  { id: "option-11", text: "Capacity to work in team spirit", group: 2 },
  { id: "option-12", text: "Capacity to adhere to time-schedule", group: 2 },
  { id: "option-13", text: "Inter personal relations", group: 2 },
  { id: "option-14", text: "Overall bearing and personality", group: 2 },
  {
    id: "option-15",
    text: "Overall Grading on ‘Personal Attributes’",
    group: 2,
  },

  {
    id: "option-16",
    text: "Knowledge of Rules / Regulations / procedures in the area of function and ability to apply them correctly",
    group: 3,
  },
  { id: "option-17", text: "Strategic Planning ability", group: 3 },
  { id: "option-18", text: "Decision making ability", group: 3 },
  { id: "option-19", text: "Coordination ability", group: 3 },
  {
    id: "option-20",
    text: "Ability to motivate and develop subordinates",
    group: 3,
  },
  { id: "option-21", text: "Initiative", group: 3 },
  {
    id: "option-22",
    text: "Overall Grading on Functional Competency",
    group: 3,
  },
];

export const AUTHORITY = ["HOI", "HOD", "UDS", "LDS"];

export const STUDENT_RANKS = [
  "All",
  "MASTER (FG)",
  "CHIEF ENGINEER (FG)",
  "CHIEF OFFICER (FG)",
  "SECOND ENGINEER (FG)",
  "SECOND OFFICER (FG)",
  "THIRD ENGINEER (FG)",
  "THIRD OFFICER (FG)",
  "FOURTH ENGINEER (FG)",
  "JUNIOR OFFICER (FG)",
  "JUNIOR ENGINEER (FG)",
  "ETO",
  "DECK CADET",
  "ENGINE CADET",
  "SARANG",
  "BOSUN",
  "AB DECK",
  "OILER/AB ENGINE",
  "DECK RATINGS",
  "ENGINE RATINGS",
  "FITTER",
  "PUMPMAN",
  "COOK",
  "MESSMAN",
  "MASTER (NCV)",
  "CHIEF ENGINEER (NCV)",
  "CHIEF OFFICER (NCV)",
  "SECOND ENGINEER (NCV)",
  "SECOND OFFICER (NCV)",
  "THIRD ENGINEER (NCV)",
  "THIRD OFFICER (NCV)",
  "FOURTH ENGINEER (NCV)",
  "JUNIOR OFFICER (NCV)",
  "JUNIOR ENGINEER (NCV)",
  "FIRST CLASS MASTER (IV)",
  "FIRST CLASS ENGINE DRIVER (IV)",
  "SECOND CLASS MASTER (IV)",
  "SECOND CLASS ENGINE DRIVER (IV)",
  "CRUISE LINERS",
  "OTHERS",
];

export const OFFICE_STAFF_DOC_INFO: TEmployeeDocs[] = [
  { doc_id: "Resume", doc_uri: null, doc_name: null },
  { doc_id: "Pan Card", doc_uri: null, doc_name: null },
  { doc_id: "Aadhaar Card", doc_uri: null, doc_name: null },
  { doc_id: "10th Pass Certificate", doc_uri: null, doc_name: null },
  { doc_id: "12th Pass Certificate", doc_uri: null, doc_name: null },
  {
    doc_id: "Choose Graduation Certificate",
    doc_uri: null,
    doc_name: null,
  },
  { doc_id: "Choose Other Certificate", doc_uri: null, doc_name: null },
  { doc_id: "Contracts/Appointment Letter", doc_uri: null, doc_name: null },
];

export const FACULTY_DOC_INFO: TEmployeeDocs[] = [
  { doc_id: "Passport", doc_uri: null, doc_name: null },
  { doc_id: "CDC", doc_uri: null, doc_name: null },
  { doc_id: "COC", doc_uri: null, doc_name: null },
  { doc_id: "TOTA/VICT/TSTA", doc_uri: null, doc_name: null },
  { doc_id: "DC", doc_uri: null, doc_name: null },
  {
    doc_id: "Pan Card",
    doc_uri: null,
    doc_name: null,
  },
  { doc_id: "Aadhaar Card", doc_uri: null, doc_name: null },
  { doc_id: "Contracts/Appointment Letter", doc_uri: null, doc_name: null },
];

export const REFUND_STATUS_OPTIONS = ["Pending", "Approved", "Reject"];

export const PAYMENT_MODES = [
  { id: 1, text: "CASH" },
  { id: 2, text: "ICICI BANK" },
  { id: 3, text: "CANARA BANK" },
  { id: 4, text: "SWIPE CARD" },
  { id: 5, text: "ONLINE" },
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

export const COURSE_CATEGORY = [
  { text: "COMPETENCY COURSES", value: "competency-courses" },
  { text: "SIMULATOR COURSES", value: "simulator-courses" },
  {
    text: "ADVANCED MODULAR COURSES",
    value: "advanced-modular-courses",
  },
  {
    text: "BASIC MODULAR COURSES",
    value: "basic-modular-courses",
  },
  { text: "REFRESHER COURSES", value: "refresher-courses" },
  { text: "PACKAGED COURSES", value: "packaged-courses" },
];
