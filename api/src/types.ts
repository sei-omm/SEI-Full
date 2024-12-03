export interface IError extends Error {
  code?: number;
  message: string;
  statusCode: number;
  isOperational: boolean;
}

export type EmailType =
  | "RESET_PASSWORD"
  | "SEND_OTP"
  | "SEND_PAYSLIP"
  | "BIRTHDATE_WISH";

export type StudentLoginTokenDataType = {
  student_id?: number;
};

export interface TTokenDataType extends StudentLoginTokenDataType {
  role: string;
  indos_number: number;
  name: string;
  login_email: string;
  institute : string
}
