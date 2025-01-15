"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import DropDown from "@/components/DropDown";
import { useRef } from "react";
import DateInput from "@/components/DateInput";
import PaymentInfoLayout from "@/components/Admission/PaymentInfoLayout";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TOneAdmission } from "@/types";
import HandleSuspence from "@/components/HandleSuspence";
import { getDate } from "@/app/utils/getDate";
import { FaRegSave } from "react-icons/fa";
import { useDoMutation } from "@/app/utils/useDoMutation";
import AppliedCourseListItem from "@/components/Course/AppliedCourseListItem";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useRouter, useSearchParams } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";

async function fetchData(url: string) {
  return (await axios.get(url)).data;
}

export default function ManageStudentAdmissionForm() {
  const { mutate } = useDoMutation();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const route = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const { data, isLoading, error } = useQuery<ISuccess<TOneAdmission>>({
    queryKey: "fetch-admission-details",
    queryFn: () =>
      fetchData(`${BASE_API}/admission?form-id=${searchParams.get("form-id")}`),

    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const handleFormSubmit = (formData: FormData) => {
    formData.set("student_id", `${searchParams.get("student-id")}`);
    formData.set("form_id", `${data?.data.course_and_student_info.form_id}`);

    mutate({
      apiPath: "/admission/save",
      method: "put",
      formData,
      onSuccess() {
        route.back();
      },
    });
  };

  return (
    <div className="w-full main-layout space-y-4">
      <h2 className="text-2xl font-semibold">Course Form</h2>

      <HandleSuspence isLoading={isLoading} dataLength={1} error={error}>
        <form ref={formRef} action={handleFormSubmit} className="space-y-4">
          {/* Courses Enrolled */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Courses Applied for</h2>

            <ul className="w-full space-y-10">
              {data?.data.course_and_student_info.enrolled_courses_info?.map(
                (item) => (
                  <AppliedCourseListItem
                    student_course_info={
                      data?.data.course_and_student_info.enrolled_courses_info
                    }
                    paymentsInfo={data?.data.student_payment_info}
                    key={item.enroll_id}
                    enroll_course_info={item}
                  />
                )
              )}
            </ul>
          </div>

          {/* Student Personal Info */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
              <Input
                name="name"
                required
                label="Full Name"
                placeholder="Somnath Gupta *"
                defaultValue={data?.data.course_and_student_info.name}
              />
              <Input
                name="email"
                required
                label="Email ID *"
                type="email"
                placeholder="somnath@gmail.com"
                defaultValue={data?.data.course_and_student_info.email}
              />
              <Input
                name="mobile_number"
                required
                label="Phone Number *"
                placeholder="8787458787"
                type="number"
                defaultValue={data?.data.course_and_student_info.mobile_number}
              />
              <Input
                name="rank"
                label="Rank/Designation"
                placeholder="Rank/Designation"
                defaultValue={data?.data.course_and_student_info.rank}
              />

              <Input
                name="indos_number"
                label="InDoS No"
                placeholder="15EL0118"
                defaultValue={data?.data.course_and_student_info.indos_number}
              />

              <DropDown
                label="Nationality *"
                name="nationality"
                options={[
                  { text: "Afghan", value: "Afghan" },
                  { text: "Albanian", value: "Albanian" },
                  { text: "Algerian", value: "Algerian" },
                  { text: "American", value: "American" },
                  { text: "Andorran", value: "Andorran" },
                  { text: "Bangladeshi", value: "Bangladeshi" },
                  { text: "Indian", value: "Indian" },
                ]}
                defaultValue={data?.data.course_and_student_info.nationality}
              />

              <Input
                required
                name="permanent_address"
                label="Permanent Address *"
                placeholder="Permanent Address"
                defaultValue={
                  data?.data.course_and_student_info.permanent_address
                }
              />
              <Input
                required
                name="present_address"
                label="Present Address *"
                placeholder="Present Address"
                defaultValue={
                  data?.data.course_and_student_info.present_address
                }
              />

              <DateInput
                required
                label="Date of Birth *"
                name="dob"
                date={getDate(
                  new Date(data?.data.course_and_student_info.dob || "")
                )}
              />
              <Input
                placeholder="CDC Number"
                label="CDC Number"
                name="cdc_num"
                defaultValue={data?.data.course_and_student_info.cdc_num}
              />
              <Input
                placeholder="Passport Number"
                label="Passport Number"
                name="passport_num"
                defaultValue={data?.data.course_and_student_info.passport_num}
              />
            </div>
          </div>

          {/* Student Emergency situation Info */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">
              Information For Emergency situation
            </h2>

            <div className="grid grid-cols-3 gap-x-5 gap-y-3 md:grid-cols-2 sm:grid-cols-1">
              <Input
                name="blood_group"
                label="Blood Group"
                placeholder="A+"
                defaultValue={data?.data.course_and_student_info.blood_group}
              />
              <Input
                name="allergic_or_medication"
                label="Whether allergic to any medication (Y/N)"
                placeholder="Y / N"
                defaultValue={
                  data?.data.course_and_student_info.allergic_or_medication
                }
              />
              <Input
                name="next_of_kin_name"
                label="Next of kin name"
                placeholder="Next of kin name"
                defaultValue={
                  data?.data.course_and_student_info.next_of_kin_name
                }
              />
              <Input
                name="relation_to_sel"
                label="Relation to sel *"
                placeholder="Relation to sel"
                defaultValue={
                  data?.data.course_and_student_info.relation_to_sel
                }
              />
              <Input
                name="emergency_number"
                label="Telephone Contact Nos.in Emergency *"
                placeholder="Relation to sel"
                defaultValue={
                  data?.data.course_and_student_info.emergency_number
                }
              />
            </div>
          </div>

          {/* Student Additionally Info */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">
              Additionally for canditates of Refresher Courses
            </h2>
            <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
              <Input
                name="number_of_the_cert"
                label="Number of the Cert.which is being refreshed :"
                placeholder="Number of the Cert.which is being refreshed :"
                defaultValue={
                  data?.data.course_and_student_info.number_of_the_cert
                }
              />
              <Input
                name="issued_by_institute"
                label="Issued by (name of the Campus) :"
                placeholder="Issued by (name of the Campus) :"
                defaultValue={
                  data?.data.course_and_student_info.issued_by_institute
                }
              />
              <Input
                name="issued_by_institute_indos_number"
                label="INDoS no (Campus) :"
                placeholder="INDoS no (Campus) :"
                defaultValue={
                  data?.data.course_and_student_info
                    .issued_by_institute_indos_number
                }
              />
            </div>
          </div>

          {/* Student Documentation */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Upload Student Document</h2>

            <Button
              onClick={() => {
                dispatch(
                  setDialog({
                    type: "OPEN",
                    dialogId: "upload-document-dialog",
                    extraValue: {
                      courseIds:
                        data?.data.course_and_student_info.enrolled_courses_info
                          .map((item) => item.course_id)
                          .join(","),
                      studentId: data?.data.course_and_student_info.student_id,
                    },
                  })
                );
              }}
              type="button"
            >
              Manage Student Documents
            </Button>
          </div>

          {/* Payment Info */}
          <PaymentInfoLayout
            paymentsInfo={data?.data.student_payment_info}
            form_id={searchParams.get("form-id") || ""}
            student_id={parseInt(searchParams.get("student-id") || "0")}
            student_course_info={
              data?.data.course_and_student_info.enrolled_courses_info
            }
          />

          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Form Status *</h2>
            <DropDown
              label=""
              name="form_status"
              options={[
                { text: "Approve", value: "Approve" },
                { text: "Cancel", value: "Cancel" },
                { text: "Pending", value: "Pending" },
              ]}
              defaultValue={data?.data.course_and_student_info.form_status}
            />
          </div>
        </form>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => {
              route.back();
            }}
            className="flex items-center gap-2"
          >
            <IoMdArrowBack />
            Back
          </Button>
          <Button
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            type="button"
            className="!border !bg-foreground !text-background flex-center gap-3"
          >
            <FaRegSave />
            Save Data
          </Button>
        </div>
      </HandleSuspence>
    </div>
  );
}
