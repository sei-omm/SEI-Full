import { z } from "zod";

export const studentFormSchema = z.object({
  name: z.string().min(1, { message: "Enter Student Full Name" }),
  email: z
    .string()
    .email({ message: "Enter A Valid Email" })
    .min(1, "Enter Student Email"),
  mobile_number: z
    .string()
    .min(1, "Phone Number Is Required")
    .max(10, "Enter A Valid 10 Digit Phone Number"),
  rank: z.string().min(1, "Choose Student Rank/Designation"),
  indos_number: z
    .string()
    .refine(
      (value) => value === "" || /^[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(value),
      {
        message: "Invalid INDOS number format. Expected format: 12AB3456",
      }
    )
    .optional(),
  nationality: z.string().min(1, "Nationality Is Required"),
  permanent_address: z.string().min(1, "Parmanent Address Is Required"),

  present_address: z.string().min(1, "Present Address Is Required"),
  dob: z.string().min(1, "Date Of Birth Is Required"),
  cdc_num: z.string().optional().nullable().default(""),
  passport_num: z.string().optional().nullable().default(""),
  coc_number: z.string().optional().nullable().default(""),
  cert_of_completency: z.string().optional().nullable().default(""),
  institute: z.string().min(1, "Campus Is Required"),
  password: z.string().min(1, "Password Is Required"),

  blood_group: z.string().optional().nullable().default(""),
  allergic_or_medication: z.string().optional().nullable().default("No"),
  next_of_kin_name: z.string().min(1, "Next Of Kin Name Is Required"),
  relation_to_sel: z.string().min(1, "Relation to sel Is Required"),
  emergency_number: z
    .string()
    .min(1, "Telephone Contact Nos.in Emergency Is Required"),

  number_of_the_cert: z.string().optional().nullable().default(""),
  issued_by_institute: z.string().optional().nullable().default(""),
  issued_by_institute_indos_number: z.string().optional().nullable().default(""),

  course_info: z
    .array(
      z.object({
        institute: z.string().min(1, "Institute is required"),
        month_year: z.string().min(1, "Select Month Year"),
        course_id: z.number().min(1, "Choose A Course"),
        batch_id: z.number().min(1, "Choose A Batch"),
      })
    )
    .optional(),

  payment_mode: z.any().optional(),
  payment_type: z.any().optional(),

  form_status: z.any().optional(),
});
