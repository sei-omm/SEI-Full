import { pool } from "../config/db";
import { createOtp } from "./createOtp";
import { sendEmail } from "./sendEmail";

export const sendOtp = async (email: string) => {
  const otp = createOtp(5);

  await sendEmail(email, "SEND_OTP", { otp: otp });

  await pool.query(
    `
        INSERT INTO otps (email, otp) VALUES ($1, $2)
        ON CONFLICT (email)
        DO UPDATE SET otp = EXCLUDED.otp;
      `,
    [email, otp]
  );
};
