import React from "react";
import { STUDENT_RANKS } from "@/app/constant";
import { StudentForm, TCourseAndStudentInfo } from "@/types";
import InputNew from "../FormInputs/InputNew";
import {
  UseFormRegister,
  Controller,
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormClearErrors,
} from "react-hook-form";
import DropDownNew from "../FormInputs/DropDownNew";
import DateInputNew from "../FormInputs/DateInputNew";

interface IProps {
  student_info?: TCourseAndStudentInfo;
  form_type: "manage-admission" | "create-admission";
  register: UseFormRegister<StudentForm>;
  control: Control<StudentForm, any>;
  errors: FieldErrors<StudentForm>;
  setValue: UseFormSetValue<StudentForm>;
  clearErrors: UseFormClearErrors<StudentForm>;
}

export default function StudentInputForm({
  // student_info,
  form_type,
  register,
  control,
  errors,
  setValue,
  clearErrors,
}: IProps) {
  return (
    <>
      {/* Student Personal Info */}
      <div className="p-10 border card-shdow rounded-3xl space-y-3">
        <h2 className="text-2xl font-semibold">Student Basic Informations</h2>
        <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
          <InputNew
            {...register("name")}
            label="Full Name"
            placeholder="Somnath Gupta *"
            error={errors.name?.message}
            // defaultValue={student_info?.name}
          />
          <InputNew
            {...register("email")}
            label="Email ID *"
            placeholder="somnath@gmail.com"
            error={errors.email?.message}
          />
          <InputNew
            {...register("mobile_number")}
            label="Phone Number *"
            placeholder="8787458787"
            type="number"
            error={errors.mobile_number?.message}
          />
          <Controller
            name="rank"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("rank")}
                label="Rank/Designation"
                options={STUDENT_RANKS.map((rank) => ({
                  text: rank,
                  value: rank,
                }))}
                onChange={(option) => {
                  setValue("rank", option.value);
                  clearErrors("rank");
                }}
                defaultValue={field.value}
                error={errors.rank?.message}
              />
            )}
          />

          <InputNew
            {...register("indos_number")}
            // pattern="[0-9]{2}[A-Z]{2}[0-9]{4}"
            // title="InDos Number should be in the format: 11EL1234 (2 digits, 2 uppercase letters, 4 digits)"
            label="InDoS No"
            placeholder="15EL0118"
            error={errors.indos_number?.message}
          />

          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("nationality")}
                label="Nationality *"
                options={[
                  { text: "Afghan", value: "Afghan" },
                  { text: "Albanian", value: "Albanian" },
                  { text: "Algerian", value: "Algerian" },
                  { text: "American", value: "American" },
                  { text: "Andorran", value: "Andorran" },
                  { text: "Bangladeshi", value: "Bangladeshi" },
                  { text: "Indian", value: "Indian" },
                ]}
                onChange={(option) => {
                  setValue("nationality", option.value);
                  clearErrors("nationality");
                }}
                defaultValue={field.value}
                error={errors.nationality?.message}
              />
            )}
          />

          <InputNew
            {...register("permanent_address")}
            name="permanent_address"
            label="Permanent Address *"
            placeholder="Permanent Address"
            error={errors.permanent_address?.message}
            // defaultValue={student_info?.permanent_address}
          />
          <InputNew
            {...register("present_address")}
            name="present_address"
            label="Present Address *"
            placeholder="Present Address"
            error={errors.present_address?.message}
            // defaultValue={student_info?.present_address}
          />

          <DateInputNew
            {...register("dob")}
            label="Date of Birth *"
            name="dob"
            // date={getDate(new Date(student_info?.dob || ""))}
            error={errors.dob?.message}
          />
          <InputNew
            {...register("cdc_num")}
            placeholder="CDC Number"
            label="CDC Number"
            name="cdc_num"
            error={errors.cdc_num?.message}
          />
          <InputNew
            {...register("passport_num")}
            placeholder="Passport Number"
            label="Passport Number"
            name="passport_num"
            error={errors.passport_num?.message}
          />
          <InputNew
            {...register("coc_number")}
            placeholder="COC No"
            label="COC Number"
            name="coc_number"
            error={errors.coc_number?.message}
          />
          <InputNew
            {...register("cert_of_completency")}
            name="cert_of_completency"
            label="Cert. Of Completency / Proficiency-Grade"
            placeholder="Type Here.."
            error={errors.cert_of_completency?.message}
          />
          {form_type === "create-admission" ? (
            <>
              <Controller
                name="institute"
                control={control}
                render={({ field }) => (
                  <DropDownNew
                    {...register("institute")}
                    label="Campus *"
                    name="institute"
                    options={[
                      { text: "Kolkata", value: "Kolkata" },
                      { text: "Faridabad", value: "Faridabad" },
                    ]}
                    onChange={(option) => {
                      setValue("institute", option.value);
                      clearErrors("institute");
                    }}
                    defaultValue={field.value}
                    error={errors.institute?.message}
                  />
                )}
              />
              <InputNew
                {...register("password")}
                label="Student Login Password *"
                name="password"
                placeholder="Login Password"
                error={errors.password?.message}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Student Emergency situation Info */}
      <div className="p-10 border card-shdow rounded-3xl space-y-3">
        <h2 className="text-2xl font-semibold">
          Information For Emergency situation
        </h2>

        <div className="grid grid-cols-3 gap-x-5 gap-y-3 md:grid-cols-2 sm:grid-cols-1">
          <InputNew
            {...register("blood_group")}
            name="blood_group"
            label="Blood Group"
            placeholder="A+"
            error={errors.blood_group?.message}
          />
          <Controller
            name="allergic_or_medication"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("allergic_or_medication")}
                name="allergic_or_medication"
                label="Whether allergic to any medication (Y/N)"
                options={[
                  { text: "Yes", value: "Yes" },
                  { text: "No", value: "No" },
                ]}
                onChange={(option) => {
                  setValue("allergic_or_medication", option.value);
                  clearErrors("allergic_or_medication");
                }}
                defaultValue={field.value}
                error={errors.allergic_or_medication?.message}
              />
            )}
          />

          <InputNew
            {...register("next_of_kin_name")}
            label="Next of kin name *"
            placeholder="Next of kin name"
            error={errors.next_of_kin_name?.message}
          />
          <InputNew
            {...register("relation_to_sel")}
            label="Relation to sel *"
            placeholder="Relation to sel"
            error={errors.relation_to_sel?.message}
          />
          <InputNew
            {...register("emergency_number")}
            label="Telephone Contact Nos.in Emergency *"
            placeholder="Type Emergency Contact Number"
            error={errors.emergency_number?.message}
          />
        </div>
      </div>

      {/* Student Additionally Info */}
      <div className="p-10 border card-shdow rounded-3xl space-y-3">
        <h2 className="text-2xl font-semibold">
          Additionally for canditates of Refresher Courses
        </h2>
        <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
          <InputNew
            {...register("number_of_the_cert")}
            label="Number of the Cert.which is being refreshed :"
            placeholder="Number of the Cert.which is being refreshed :"
            error={errors.number_of_the_cert?.message}
          />
          <InputNew
            {...register("issued_by_institute")}
            label="Issued by (name of the Campus) :"
            placeholder="Issued by (name of the Campus) :"
            error={errors.issued_by_institute?.message}
          />
          <InputNew
            {...register("issued_by_institute_indos_number")}
            label="INDoS no (Campus) :"
            placeholder="INDoS no (Campus) :"
            error={errors.issued_by_institute_indos_number?.message}
          />
        </div>
      </div>
    </>
  );
}
