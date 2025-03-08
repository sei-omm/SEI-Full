export interface IError extends Error {
  code?: number;
  message: string;
  statusCode: number;
  isOperational: boolean;
  key?: string;
}

export type EmailType =
  | "RESET_PASSWORD"
  | "SEND_OTP"
  | "SEND_PAYSLIP"
  | "BIRTHDATE_WISH"
  | "PAYMENT_LINK"
  | "SEND_JOB_INFO_VENDOR"

export type StudentLoginTokenDataType = {
  student_id?: number;
  indos_number: string;
};

export type EmployeeLoginTokenDataType = {
  employee_id?: number;
  login_email: string;
};

export interface TTokenDataType
  extends StudentLoginTokenDataType,
    EmployeeLoginTokenDataType {
  role: string;
  name: string;
  institute: string;
}

export type TEmployeeDocs = {
  doc_id: string;
  doc_uri: string | null;
  doc_name: string | null;
};

export type TRoles = "Admin" | "Employee" | "Student" | "Own" | "Faculty";

export type TEnrollCourseData = {
  course_ids: string; // Comma-separated string of course IDs
  total_price: string; // Total price as a string
  minimum_to_pay: number; // Minimum amount to pay as a number
  batch_ids: string; // Comma-separated string of batch IDs
  student_id: string; // Student ID as a string
  payment_type: string; // Payment mode as a string
  order_id: string;
  is_in_waiting_list : string;
  institutes : string;
};
