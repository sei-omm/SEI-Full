import nodemailer from "nodemailer";
import { EmailType } from "../types";
import { resetPasswordTemplate } from "../config/resetPasswordTemplate";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { sendOtpTemplate } from "../config/sendOtpTemplate";
import { generateHappyBirthdayEmail } from "../config/generateHappyBirthdayEmail";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ommdigitalwebsite@gmail.com", // Your Gmail address
    pass: "xdra wwqv bmwo mrta", // Your Gmail password or app-specific password
  },
});

export const sendEmail = async (to: string[] | string, type: EmailType, templateData ? : ejs.Data) => {
  const sendForm = process.env.EMAIL_SENDER_EMAIL;

  let mailOptions = {};

  if (type === "RESET_PASSWORD") {
    const html = await resetPasswordTemplate(templateData || {});

    mailOptions = {
      from: `"Password Reset Email Form SEI" <${sendForm}>`, // Sender address
      to, // List of recipients
      subject: "Password Reset Email SEI", // Subject line
      html,
    };
  } else if(type === "SEND_OTP") {
    const html = await sendOtpTemplate(templateData || {});
    mailOptions = {
      from: `"OTP Verification Form SEI" <${sendForm}>`, // Sender address
      to, // List of recipients
      subject: "Otp Verification Email SEI", // Subject line
      html,
    };
  } else if (type === "BIRTHDATE_WISH") {
    const html = await generateHappyBirthdayEmail(templateData || {});
    mailOptions = {
      from: `"${templateData?.student_name } Happy Birthday To You" <${sendForm}>`, // Sender address
      to, // List of recipients
      subject: "Birthday Wish To You From SEI", // Subject line
      html,
    };
  }

  return new Promise(
    (resolve: (value: SMTPTransport.SentMessageInfo) => void, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject("Error sending email:" + error);
        }
        resolve(info);
      });
    }
  );
};
