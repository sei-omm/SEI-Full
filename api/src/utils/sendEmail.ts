// import nodemailer from "nodemailer";
// import { EmailType } from "../types";
// import { resetPasswordTemplate } from "../config/resetPasswordTemplate";
// import SMTPTransport from "nodemailer/lib/smtp-transport";
// import { sendOtpTemplate } from "../config/sendOtpTemplate";
// import { generateHappyBirthdayEmail } from "../config/generateHappyBirthdayEmail";
// import { generatePaymentLinkEmail } from "../config/generatePaymentLinkEmail";
// import { generateEmailTemplate } from "../config/generateEmailTemplate";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "ommdigitalwebsite@gmail.com", // Your Gmail address
//     pass: "xdra wwqv bmwo mrta", // Your Gmail password or app-specific password
//   },
// });

// export const sendEmail = async (
//   to: string[] | string,
//   type: EmailType,
//   templateData?: ejs.Data
// ) => {
//   const sendForm = process.env.EMAIL_SENDER_EMAIL;

//   let mailOptions = {};

//   if (type === "RESET_PASSWORD") {
//     const html = await resetPasswordTemplate(templateData || {});

//     mailOptions = {
//       from: `"Password Reset Email Form SEI" <${sendForm}>`, // Sender address
//       to, // List of recipients
//       subject: "Password Reset Email SEI", // Subject line
//       html,
//     };
//   } else if (type === "SEND_OTP") {
//     const html = await sendOtpTemplate(templateData || {});
//     mailOptions = {
//       from: `"OTP Verification Form SEI" <${sendForm}>`, // Sender address
//       to, // List of recipients
//       subject: "Otp Verification Email SEI", // Subject line
//       html,
//     };
//   } else if (type === "BIRTHDATE_WISH") {
//     const html = await generateHappyBirthdayEmail(templateData || {});
//     mailOptions = {
//       from: `"${templateData?.student_name} Happy Birthday To You" <${sendForm}>`, // Sender address
//       to, // List of recipients
//       subject: "Birthday Wish To You From SEI", // Subject line
//       html,
//     };
//   } else if (type === "PAYMENT_LINK") {
//     const html = await generatePaymentLinkEmail(templateData || {});
//     mailOptions = {
//       from: `"Payment Link For ${templateData?.course_name}" <${sendForm}>`, // Sender address
//       to, // List of recipients
//       subject: "Payment Link From SEI", // Subject line
//       html,
//     };
//   } else if (type === "SEND_JOB_INFO_VENDOR") {
//     const html = await generateEmailTemplate(
//       templateData || {},
//       "job_posting.html"
//     );
//     mailOptions = {
//       from: `"Job Details From SEI" <${sendForm}>`, // Sender address
//       to, // List of recipients
//       subject: "Job Details From SEI", // Subject line
//       html,
//     };
//   }

//   return new Promise(
//     (resolve: (value: SMTPTransport.SentMessageInfo) => void, reject) => {
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           reject("Error sending email:" + error);
//         }
//         resolve(info);
//       });
//     }
//   );
// };

import * as https from "https";
import ejs from "ejs";

const api = "https://api.github.com/repos/sei-omm/send_email/actions/workflows/email.yml/dispatches";
const options = {
    method: "POST",
    headers: {
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        Authorization: `Bearer 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`, // Use env variable
        "User-Agent": "MyApp/1.0" // Required by GitHub API
    }
};

export const sendEmail = async (
  to: string[] | string,
  type: string, // Changed `EmailType` to `string` if not defined
  templateData?: ejs.Data
) => {
    const data = JSON.stringify({
        ref: "main",
        inputs: {
            to: Array.isArray(to) ? to.join(",") : to,
            email_type: type,
            data: JSON.stringify(templateData || {}) // Prevents `undefined`
        }
    });

    return new Promise((resolve, reject) => {
        const req = https.request(api, options, (res) => {
            let responseData = "";

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                responseData += chunk;
            });

            res.on("end", () => {
                resolve(responseData);
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};
