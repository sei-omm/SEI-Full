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
