// export const BASE_API = "https://sei-api-zeta.vercel.app/api/v1";

import { TEmployeeDocs } from "@/types";

// export const BASE_API = "http://localhost:8080/api/v1";
export const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

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

export const employeeAuthority = [
  { name: "Employee", score: 0 },
  { name: "Reporting Authority", score: 1 },
  { name: "Review Authority", score: 2 },
];

export const STUDENT_RANKS = ["Master", "Captain", "Other"];

export const OFFICE_STAFF_DOC_INFO : TEmployeeDocs[] = [
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
];

export const FACULTY_DOC_INFO : TEmployeeDocs[] = [
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
];