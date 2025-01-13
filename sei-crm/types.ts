import { PutBlobResult } from "@vercel/blob";
import { Dispatch, SetStateAction } from "react";

export interface ITabItems {
  name: string;
  slug: string;
  default?: boolean;
}

export type ServicesType = {
  id: string;
  icon: string;
  name: string;
  description: string;
};

export interface ISuccess<T = null> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

export interface IError extends ISuccess {}

export interface IDepartment {
  id: number;
  name: string;
  designation: string;
}

export interface IJob {
  id: number;
  job_title: string;
  address: string;
  exprience: string;
  department: number;
  department_name: string;
  created_at: string;
  job_description: string;
}

export interface IJobAppliedCandidate {
  id: number;
  application_id: string;
  name: string;
  email: string;
  contact_number: string;
  dob: string;
  work_experience: string;
  resume: string;
  application_status: string;
  job_id: string;
}

export type ApplicationStatusType = "pending" | "success" | "decline";
export type AttendanceStatusType = "Present" | "Absent" | "Leave" | "Pending";
export type GenderType = "Male" | "Female" | "Other";
export type MaritalStatus = "Married" | "Un-Married";

export interface IHREmployee {
  employee_id: number;
  name: string;
  profile_image: string;
  job_title: string;
  department_name: string;
  attendance_status: AttendanceStatusType;
}

export type EmployeeType = "Office Staff" | "Faculty";
export interface IEmployee {
  id: number;
  name: string;
  employee_id: string | null;
  joining_date: string; // ISO date string
  job_title: string;
  department_id: number;
  contact_number: string;
  email_address: string;
  living_address: string;
  dob: string; // ISO date string
  gender: GenderType;
  marital_status: MaritalStatus;
  bank_name: string;
  bank_account_no: string;
  account_holder_name: string;
  ifsc_code: string;
  profile_image: string | null;
  // resume: string;
  // pan_card?: string;
  // aadhaar_card?: string;
  // ten_pass_certificate?: string;
  // twelve_pass_certificate?: string;
  // graduation_certificate?: string;
  // other_certificate?: string;
  basic_salary: string;
  hra: string;
  other_allowances: string;
  provident_fund: string;
  professional_tax: string;
  esic: string;
  income_tax: string;
  is_active: boolean;
  login_email: string;
  login_password: string;
  department_name: string;
  attendance_status: string;

  rank: string;
  fin_number: string;
  indos_number: string;
  cdc_number: string;
  grade: string;
  qualification: string;
  additional_qualification: string;
  selling_experience: string;
  teaching_experience: string;

  max_teaching_hrs_per_week: string | null;
  faculty_attendance_type: string;
  employee_type: string;
  institute: string | null;

  designation: string | null;
  authority: string | null;
}

export type ILeaveStatus = "pending" | "success" | "decline";
export interface ILeave {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_profile_image: string;
  leave_from: string;
  leave_to: string;
  leave_reason: string;
  leave_status: ILeaveStatus;
}

export type InputTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export type OptionsType = { text: string; value: any };

export type TBatches = {
  // batch_id: number;
  // start_date: string;
  // end_date: string;
  // batch_fee: number;
  // batch_total_seats: number;
  // batch_reserved_seats: number;
  // visibility: string;
  batch_id: number;
  start_date: string;
  end_date: string;
  batch_fee: number;
  min_pay_percentage: number;
  batch_total_seats: number;
  batch_reserved_seats: number;
  visibility: string;
  course_id: number;
};

export type ICourseWithSubject = {
  course_id: number;
  course_name: string;
  subjects: string;
};

export interface ICourse extends ICourseWithSubject {
  course_code: string;
  institute: string;
  course_type: string;
  require_documents: string;
  course_duration: string;
  course_fee: number;
  min_pay_percentage: number;
  total_seats: number;
  remain_seats: number;
  course_visibility: string;
  course_update_time: string;
  created_at: string;
  course_pdf?: string;
  course_showing_order: number;
  max_batch: number;
  batches?: TBatches[];
}

export type DropDownOptionType = {
  text: string;
  value: string;
};

export type EmployeeLoginInfoType = {
  name: string;
  profile_image: string | "null";
};

export type TStudentPayment = {
  // course_id: number;
  payment_id: string;
  paid_amount: number;
  remark: string;
  mode: string;
  order_id: null | string;
  misc_payment: number;
  misc_remark: string;
  discount_amount: number;
  discount_remark: string;
  created_at: string;
  payment_type: string;
};

export type TPaymentInfo = {
  total_fee: number;
  total_paid: number;
  total_due: number;
  total_misc_payment: number;
  total_discount: number;
  payments: TStudentPayment[];
};

export type TEnrollCourses = {
  enroll_id: number;
  course_name: string;
  course_id: number;
  course_require_documents: string;
  batch_start_date: string;
  batch_end_date: string;
  batch_fee: number;
  enrollment_status: string;
  batch_id: number;
};

export type TOneAdmission = {
  course_and_student_info: {
    student_id: number;
    course_id: number;
    name: string;
    email: string;
    mobile_number: string;
    dob: string;
    profile_image: string | null;
    indos_number: string;
    rank: string;
    nationality: string;
    permanent_address: string;
    present_address: string;
    blood_group: string;
    allergic_or_medication: string;
    next_of_kin_name: string;
    relation_to_sel: string;
    emergency_number: string;
    number_of_the_cert: string;
    issued_by_institute: string;
    issued_by_institute_indos_number: string;
    id_proof: null | string;
    address_proof: null | string;
    academic_proof: null | string;
    form_status: string;
    form_id: string;
    cdc_num: string | null;
    passport_num: string | null;
    enrolled_courses_info: TEnrollCourses[];
  };
  student_payment_info: TPaymentInfo;
};

export type TAdmissionTable = {
  heads: string[];
  body: (string | null | undefined)[][];
};

export type TStudentsUploadedDocuments = {
  student_id: number;
  doc_id: string;
  doc_uri: string;
  doc_name: string;
};

export type TSetUploadStatus = Dispatch<
  SetStateAction<{
    status: "done" | "processing" | "uploading";
    progress: number;
  }>
>;

export type TEmployeeDocs = {
  doc_id: string;
  doc_uri: string | null;
  doc_name: string | null;
};

export interface TEmployeeDocsFromDB extends TEmployeeDocs {
  employee_id: number;
}

export type TCourseDropDown = {
  course_id: number;
  course_name: string;
  course_batches: string[];
};

export type TLibraryVisibility = "subject-specific" | "course-specific";

export type TLibrary = {
  library_id: number;
  library_file_name: string;
  library_file_type: string;
  is_active: boolean;

  library_resource_link: string;
  allow_download: boolean;

  visibility: TLibraryVisibility;

  institute: string;

  created_at: string;

  subject_ids: number[];
  course_ids: number[];
};

export type TUploadMethod = {
  onUploaded?: (blob: PutBlobResult[]) => void;
  onError?: (error: Error) => void;
  onProcessing?: () => void;
  onUploadProgress?: (percentage: number) => void;
  onFinally?: (data: Error | PutBlobResult[]) => void;
};

export type TSubject = {
  subject_id: number;
  subject_name: string;
};

export type TFileFolderOptionAction =
  | "open"
  | "delete"
  | "rename"
  | "copy"
  | "cut"
  | "paste";

export type TFolder = {
  folder_id: number;
  folder_name: string;
  parent_folder_id?: number;
};

export type TFile = {
  file_id: number;
  file_name: string;
  file_type: string;
  file_url: string;
  folder_id?: number;
};

export type IStorageResponse = {
  folders: TFolder[];
  files: TFile[];
};

export type TDurable = {
  durable_id: number;
  room_name: string;
  floor: number;
  number_of_rows: number;
  capasity: number;
  available_items: string;
  is_available: boolean;
  created_at: string;
};

export type TConsumableCategory = {
  category_id: number;
  category_name: string;
};

export type TVendor = {
  vendor_id: number;
  vendor_name: string;
  institute: string;
  service_type: string;
  address: string;
  contact_details: string;
  created_at: string;
};

export type TVendorIdName = {
  vendor_id: number;
  vendor_name: string;
};

export interface TConsumable extends TVendorIdName {
  consumable_id: number;
  item_name: string;
  category_id: number;
  quantity: number;
  min_quantity: number;
  last_purchase_date: string;
  cost_per_unit: number;
  total_volume: number;
  remark: string;
  created_at: string;
  category_name: string;
}

export type TInventoryItem = {
  item_id: number;
  item_name: string;
  category: number;
  sub_category: number;
  where_to_use: string;
  used_by: string;
  description: string;
  minimum_quantity: number;
  institute: string;
  created_at: string;
};

export type TInventoryStock = {
  stock_id: number;
  opening_stock: number;
  item_consumed: number;
  closing_stock: number;
  status: string;
  vendor_id: number;
  cost_per_unit_current: string;
  total_value: string;
  remark: string;
  item_id: number;
  type: string;
  purchase_date: string;
  created_at: string;
  vendor_name: string;
};

export type TInventoryWithStockItem = {
  item_id: number;
  item_name: string;
  category: number;
  sub_category: number;
  minimum_quantity: number;
  opening_stock: string | null;
  item_consumed: string | null;
  closing_stock: string | null;
  current_status: string | null;
  current_purchase_date: string;
  current_vendor_id: number | null;
  current_vendor_name: string | null;
  cost_per_unit_current: string | null;
  cost_per_unit_previous: string | null;
  total_value: string | null;
};

export type TMaintenanceRecord = {
  record_id: number;
  item_id: number;
  item_name: string;
  maintence_date: string;
  work_station: string;
  description_of_work: string;
  department: string;
  assigned_person: string;
  approved_by: string;
  cost: string;
  status: string;
  completed_date: string;
  remark: string;
  created_at: string;
  institute: string;
};

export type TOccupancyReport = {
  course_id: number;
  course_name: string;
  course_code: string;
  total_batch_conducted: string;
  total_candidate_strength: string;
  occupency: string;
  max_batch_per_month: number;
  occupency_percentage: string;
};

export type TPlannedMaintenanceSystem = {
  planned_maintenance_system_id: number;
  item_id: number;
  item_name: string;
  frequency: string;
  last_done: string;
  next_due: string;
  description: string;
  remark: string;
  created_at: string;
};

export type TRefundReport = {
  name: string;
  course_name: string;
  start_date: string; // ISO date string, can be adjusted if a Date object is preferred
  payment_details: string;
  total_amount: string; // Assuming this is a string for the sake of precision (e.g., to handle currency formats)
  order_ids: string;
  payment_dates: string; // Assuming this is a date string
  receipt_nos: string;
  payment_types: string;
  refund_amount: string; // Same as total_amount, typically represented as a string to avoid floating point precision issues
  refund_reason: string;
  bank_details: string;
  created_at: string; // ISO date string
  executive_name: string;
  refund_id: string;
};

export type TDesignation = {
  deg_id: number;
  department_id: number;
  deg_name: string;
  department_name: string;
};

export type TAppraisalList = {
  appraisal_id: number;
  created_at: string;
  sended_to: { name: string; status: string }[];
};

export type TAppraisal = {
  appraisal_id: number;
  employee_id: number;
  discipline: string;
  duties: string;
  targets: string;
  achievements: string;
  appraisal_options: string | null;
  state_of_health: string | null;
  integrity: string | null;
  created_at: string;
  sended_to: { name: string; status: string }[];
};
