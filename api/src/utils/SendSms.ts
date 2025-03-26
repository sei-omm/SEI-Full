import { createOtp } from "./createOtp";
import { pool } from "../config/db";
import { SmsApiClient } from "../lib/SmsApiClient";

export const sendOtp = async (phoneNumber: string) => {
  const otp = createOtp(5);

  const smsApiClient = new SmsApiClient();
  await smsApiClient.sendSingleSms(
    phoneNumber,
    // `Dear SEIET SAILOR, use OTP ${otp} to verify your mobile number. Please do not share this OTP. It is valid for 5 minutes. – SEI Education`,
    `Dear SEIET SAILOR, use OTP ${otp} for login to your SEI-KOL profile. Please do not share this OTP. SEI Education`,
    "Kolkata"
  );
  await pool.query(
    `
            INSERT INTO otps (mobile_number, otp) VALUES ($1, $2)
            ON CONFLICT (mobile_number)
            DO UPDATE SET otp = EXCLUDED.otp;
          `,
    [phoneNumber?.replace("+91", ""), otp]
  );
};
