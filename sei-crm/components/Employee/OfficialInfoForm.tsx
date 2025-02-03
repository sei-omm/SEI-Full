import React, { useEffect, useRef, useState } from "react";
import DropDown from "../DropDown";
import Input from "../Input";
import DateInput from "../DateInput";
import { getDate } from "@/app/utils/getDate";
import EAuthorityInfo from "./EAuthorityInfo";
import { IDepartment, IEmployee, ISuccess, TPayscaleBoth } from "@/types";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useQueries, UseQueryResult } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Spinner from "../Spinner";
import HandleDataSuspense from "../HandleDataSuspense";
import { queryClient } from "@/redux/MyProvider";
import { beautifyDate } from "@/app/utils/beautifyDate";

interface IProps {
  isNewEmployee: boolean;
  departements?: IDepartment[];
  employeeInfo?: IEmployee;
  employeeID: number | "add-employee" | "add-faculty";
  onDateOfJoinChnage: (value: string) => void;
  joinDate?: string;
  employeeInstituteRef: React.MutableRefObject<string | null>;
}
async function getPayscales() {
  return (await axios.get(`${BASE_API}/hr/payscale?item_type=Both`)).data;
}

export default function OfficialInfoForm({
  isNewEmployee,
  employeeInfo,
  departements,
  employeeID,
  onDateOfJoinChnage,
  joinDate,
  employeeInstituteRef,
}: IProps) {
  const [providedAnyAssets, setProvidedAnyAssets] = useState("No");
  const deleteBtnClickedIndex = useRef(0);

  useEffect(() => {
    if (employeeInfo?.assigned_assets.length !== 0) {
      setProvidedAnyAssets("Yes");
    }
  }, [employeeInfo]);

  const [payscale] = useQueries<[UseQueryResult<ISuccess<TPayscaleBoth>>]>([
    {
      queryKey: "get-payscale-dropdown",
      queryFn: getPayscales,
    },
  ]);

  const { isLoading, mutate } = useDoMutation();
  const { isLoading: isDateChenging, mutate: changeDate } = useDoMutation();

  function handleRemoveAsset(assets_id: number) {
    mutate({
      apiPath: `/employee/assets/${assets_id}`,
      method: "delete",
      onSuccess() {
        queryClient.invalidateQueries("get-employee-info");
      },
    });
  }

  const dispatch = useDispatch();

  const returnAssetsDate = useRef<string>("");

  const handleReturnAssetsInputBlur = (assets_id: number) => {
    if (!confirm("Are you sure you want to change return date")) return;

    changeDate({
      apiPath: "/employee/assets",
      method: "patch",
      formData: {
        return_date: returnAssetsDate.current,
      },
      id: assets_id,
      onSuccess() {
        queryClient.invalidateQueries("get-employee-info");
      },
    });
  };

  return (
    <>
      {/* Official Info */}
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Official Informations</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <EAuthorityInfo
            departements={departements}
            employeeInfo={employeeInfo}
          />
          <Input
            defaultValue={employeeInfo?.job_title || ""}
            required
            name="job_title"
            label="Job Title *"
            placeholder="Software Engineer"
          />
          <DateInput
            required
            name="joining_date"
            onChange={onDateOfJoinChnage}
            label="Date Of Joining *"
            date={getDate(new Date(joinDate || ""))}
          />
          {!isNewEmployee ? (
            <Input
              name="login_email"
              key={"login_email"}
              viewOnly={true}
              // type="email"
              // label="Employee Login Email"
              label="Employee ID"
              placeholder="SEI01012501K"
              defaultValue={employeeInfo?.login_email}
              // defaultValue={employeeInfo?.joining_date}
            />
          ) : null}

          <Input
            defaultValue={employeeInfo?.login_password || ""}
            // maxLength={12}
            required
            name="login_password"
            label="Employee Login Password *"
            type="password"
            placeholder="adminSom@123"
          />
          {/* <Input
            required
            name="rank"
            label="Employee Rank"
            placeholder="Principal"
            defaultValue={employeeInfo?.rank}
          /> */}

          {employeeID === "add-faculty" ||
          employeeInfo?.employee_type === "Faculty" ? (
            <>
              <Input
                pattern="[A-Z][0-9]+"
                title="FIN Number must be alphanumeric (e.g., T12345)."
                type="text"
                name="fin_number"
                label="FIN Number"
                placeholder="154578"
                defaultValue={employeeInfo?.fin_number}
              />
              <Input
                pattern="[0-9]{2}[A-Z]{2}[0-9]{4}"
                title="InDos Number should be in the format: 11EL1234 (2 digits, 2 uppercase letters, 4 digits)"
                type="text"
                name="indos_number"
                label="Indos Number"
                placeholder="Type Indos Number"
                defaultValue={employeeInfo?.indos_number}
              />
              <Input
                type="text"
                name="cdc_number"
                label="CDC Number"
                placeholder="4541"
                defaultValue={employeeInfo?.cdc_number}
              />
              <Input
                name="grade"
                label="Grade"
                placeholder="A+"
                defaultValue={employeeInfo?.grade}
              />
              <DropDown
                key={"qualification"}
                label="Select Qualification"
                options={[
                  { text: "TOTA", value: "TOTA" },
                  { text: "VICT", value: "VICT" },
                ]}
                name="qualification"
                defaultValue={employeeInfo?.qualification}
              />
              {/* additional qualification */}
              <DropDown
                key={"additional_qualification"}
                label="Additional Qualification"
                options={[
                  { text: "AECS", value: "AECS" },
                  { text: "TSTA", value: "TSTA" },
                ]}
                name="additional_qualification"
                defaultValue={employeeInfo?.additional_qualification}
              />
              <Input
                name="selling_experience"
                label="Selling Experience"
                placeholder="1 Years"
                defaultValue={employeeInfo?.selling_experience}
              />
              <Input
                name="teaching_experience"
                label="Teaching Experience"
                placeholder="2 Years"
                defaultValue={employeeInfo?.teaching_experience}
              />
              <Input
                name="max_teaching_hrs_per_week"
                label="Max Teaching Hours Per Week"
                placeholder="2 Hours"
                defaultValue={employeeInfo?.max_teaching_hrs_per_week}
              />
              <DropDown
                key={"faculty_attendance_type"}
                label="Faculty Attendance Type"
                options={[
                  { text: "Regular", value: "Regular" },
                  { text: "Visiting", value: "Visiting" },
                ]}
                name="faculty_attendance_type"
                defaultValue={employeeInfo?.faculty_attendance_type}
              />
            </>
          ) : null}
          <DropDown
            onChange={(value) => (employeeInstituteRef.current = value.value)}
            key={"institute"}
            label="Campus *"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            name="institute"
            defaultValue={employeeInfo?.institute}
          />
          <HandleDataSuspense
            error={payscale.error}
            isLoading={payscale.isLoading}
            data={payscale.data}
          >
            {(data) => (
              <>
                <DropDown
                  key="Payscale"
                  name="payscale_label"
                  label="Payscale *"
                  options={
                    data.data.label.map((item) => ({
                      text: item.item_value,
                      value: item.item_value,
                    })) || []
                  }
                  defaultValue={employeeInfo?.payscale_label}
                />
                <DropDown
                  key="Payscale Years"
                  name="payscale_year"
                  label="Payscale Years *"
                  options={
                    data.data.year.map((item) => ({
                      text: item.item_value,
                      value: item.item_value,
                    })) || []
                  }
                  defaultValue={employeeInfo?.payscale_year}
                />
              </>
            )}
          </HandleDataSuspense>

          {!isNewEmployee ? (
            <DropDown
              onChange={(item) => setProvidedAnyAssets(item.value)}
              label="Provide Any Assets"
              options={[
                { text: "No", value: "No" },
                { text: "Yes", value: "Yes" },
              ]}
              defaultValue={providedAnyAssets}
            />
          ) : null}
        </div>
      </div>

      {/* Official Assets Info */}
      {providedAnyAssets === "Yes" && !isNewEmployee ? (
        <div className="p-10 border card-shdow rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold pb-6">
              Provided Assets Informations
            </h2>

            <Button
              onClick={() => {
                dispatch(
                  setDialog({ dialogId: "assign-assets", type: "OPEN" })
                );
              }}
              type="button"
              className="flex items-center gap-3"
            >
              <IoIosAdd size={20} />
              Assign Assets
            </Button>
          </div>

          <ul className="space-y-3">
            {employeeInfo?.assigned_assets.map((item, index) => (
              <li key={item.assets_id} className="border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="font-semibold">
                      Assets Name :- {item.assets_name}
                    </h2>
                    <h3 className="text-sm text-gray-600">
                      <span className="font-semibold">Issued By :</span>{" "}
                      {item.issued_by}
                    </h3>
                    <h3 className="text-sm text-gray-600">
                      <span className="font-semibold">Issued Date :</span>{" "}
                      {beautifyDate(item.issue_date)}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    {isDateChenging ? (
                      <Spinner size="20px" />
                    ) : (
                      <DateInput
                        key={"date-input-" + index}
                        onChange={(value) => (returnAssetsDate.current = value)}
                        onBlur={() =>
                          handleReturnAssetsInputBlur(item.assets_id)
                        }
                        label="Return Date"
                        name="return_date"
                        date={item.return_date}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 *:cursor-pointer">
                    {isLoading && index === deleteBtnClickedIndex.current ? (
                      <Spinner size="18px" />
                    ) : (
                      !item.return_date && (
                        <AiOutlineDelete
                          onClick={() => {
                            if (isDateChenging) return;

                            handleRemoveAsset(item.assets_id);
                            deleteBtnClickedIndex.current = index;
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
