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
}

export interface IJob {
  id: number;
  job_title: string;
  address: string;
  exprience: string;
  department: number;
  department_name : string;
  created_at: string;
  job_description : string;
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
  resume: string;
  pan_card?: string;
  aadhaar_card?: string;
  ten_pass_certificate?: string;
  twelve_pass_certificate?: string;
  graduation_certificate?: string;
  other_certificate?: string;
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

export interface ICourse {
  course_id: number;
  course_code: string;
  course_name: string;
  institute: string;
  course_type: string;
  require_documents: string;
  subjects: string;
  course_duration: string;
  course_fee: number;
  min_pay_percentage: number;
  total_seats: number;
  remain_seats: number;
  course_visibility: string;
  course_update_time: string;
  created_at: string;
  course_pdf?: string;
  course_showing_order : number;
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
  created_at: string;
  payment_type: string;
};

export type TPaymentInfo = {
  total_fee: number;
  total_paid: number;
  total_due: number;
  total_misc_payment: number;
  payments: TStudentPayment[];
};

export type TEnrollCourses = {
  enroll_id : number,
  course_name: string;
  course_id : number;
  course_require_documents : string;
  batch_start_date: string;
  batch_end_date: string;
  batch_fee: number;
  enrollment_status : string;
}

export type TOneAdmission = {
  course_and_student_info : {
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
    enrolled_courses_info: TEnrollCourses[];
  }
  student_payment_info : TPaymentInfo
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