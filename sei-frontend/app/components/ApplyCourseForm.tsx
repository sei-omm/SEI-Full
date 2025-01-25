"use client";

import Input from "./Input";
import Button from "./Button";
import { FormEvent, useEffect, useState } from "react";
import { BASE_API, STUDENT_RANKS } from "../constant";
import {
  IResponse,
  TCourseBatches,
  TMultipleCoursePrice,
  TStudentRegistationForm,
} from "../type";
import SelectedCourseTable from "./SelectedCourseTable";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import axios from "axios";
import { FaLongArrowAltDown } from "react-icons/fa";
import { setDialog } from "../redux/slice/dialog.slice";
import { axiosQuery } from "../utils/axiosQuery";
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/getAuthToken";
import { useSearchParams } from "next/navigation";
import { queryClient } from "../redux/MyProvider";

interface IProps {
  form_info: TStudentRegistationForm | null;
}

export default function ApplyCourseForm({ form_info }: IProps) {
  const [userFormInfo, setuserFormInfo] = useState<object | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const searchParams = useSearchParams();

  const dispatch = useDispatch();

  // const cartData = useSelector((state: RootState) => state.courseCart);

  const cartData = queryClient.getQueriesData([
    "get-batch-info",
    searchParams.toString(),
  ])[0][1] as IResponse<TCourseBatches[]> | undefined;

  const [calclutedPrice, setCalclutedPrice] = useState({
    totalPrice: 0,
    minToPay: 0,
  });

  useQuery<IResponse<TMultipleCoursePrice[]> | undefined>({
    queryKey: ["get-cart-courses-info", searchParams.toString()],
    queryFn: async () => {
      const ids: string[] = [];
      searchParams.forEach((value) => {
        ids.push(value);
      });
      if (ids.length === 0) return;

      return (
        await axios.get(
          `${BASE_API}/course/get-multi-batch-price?batch_ids=${ids.join(",")}`
        )
      ).data;
    },
    onSuccess(data) {
      let totalPrice = 0;
      let minToPay = 0;
      data?.data.forEach((item) => {
        totalPrice += parseInt(item.total_price.toString());
        minToPay += parseInt(item.minimum_to_pay.toString());
      });
      setCalclutedPrice({ totalPrice, minToPay });
    },
    refetchOnMount: true,
  });

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const oldDates = new Map<string, boolean>();
    let isDuplicatedFound = false;
    cartData?.data.forEach((item) => {
      if (oldDates.has(item.start_date)) {
        isDuplicatedFound = true;
        return;
      }
      oldDates.set(item.start_date, true);
    });

    if (isDuplicatedFound) {
      return alert(
        "You have selected two courses with the same date please delte one of them."
      );
    }

    setIsSavingForm(true);

    if (userFormInfo === null) {
      const formData = new FormData(event.currentTarget);

      const { error } = await axiosQuery<IResponse, IResponse>({
        url: `${BASE_API}/student/save-form`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthToken(),
        },
        data: formData,
      });

      if (error) {
        alert(error.message);
        return toast.error(error.message);
      }

      localStorage.setItem(
        "student-form-info",
        JSON.stringify(Object.fromEntries(formData.entries()))
      );
    }

    setIsSavingForm(false);

    dispatch(
      setDialog({
        type: "OPEN",
        dialogKey: "open-process-payment-dialog",
        extraValue: {
          totalPrice: calclutedPrice.totalPrice,
          minToPay: calclutedPrice.minToPay,
          currentTarget: event.currentTarget,
          batch_ids: cartData?.data.map((item) => item.batch_id).join(","),
          course_ids: cartData?.data.map((item) => item.course_id).join(","),
          isInWaitingLists: cartData?.data
            .map((item) => item.batch_reserved_seats >= item.batch_total_seats)
            .join(","),
        },
      })
    );
  };

  useEffect(() => {
    if (window) {
      const studetnLocalInfo = localStorage.getItem("student-form-info");
      if (studetnLocalInfo) {
        setuserFormInfo(JSON.parse(studetnLocalInfo));
      }
    }
  }, []);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full main-layout py-10 space-y-4"
    >
      {userFormInfo !== null ? null : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Fill Up The Form</h2>
          <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
            {/* <Input label="Your Full Name" placeholder="Somnath Gupta" /> */}
            {/* <Input
              name="rank"
              label="Rank/Designation"
              placeholder="Rank/Designation"
            /> */}
            <div>
              <span className="inline-block font-medium">
                Rank/Designation *
              </span>
              <div className="px-3 border bg-[#e9b9582a] border-gray-400">
                <select
                  name="rank"
                  className="w-full outline-none py-2 bg-transparent"
                  defaultValue={form_info?.rank}
                >
                  {STUDENT_RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* <Input label="InDoS No" placeholder="InDoS No" /> */}
            {/* <Input label="Date of Birth *" type="date" /> */}

            <div>
              <span className="inline-block font-medium">Nationality *</span>
              <div className="px-3 border bg-[#e9b9582a] border-gray-400">
                <select
                  name="nationality"
                  className="w-full outline-none py-2 bg-transparent"
                  defaultValue={form_info?.nationality}
                >
                  <option value="Indian">Indian</option>
                  <option value="Afghan">Afghan</option>
                  <option value="Albanian">Albanian</option>
                  <option value="Algerian">Algerian</option>
                  <option value="American">American</option>
                  <option value="Andorran">Andorran</option>
                  <option value="Bangladeshi">Bangladeshi</option>
                </select>
              </div>
            </div>

            <Input
              required
              name="permanent_address"
              label="Permanent Address *"
              placeholder="Permanent Address"
              defaultValue={form_info?.permanent_address}
            />
            <Input
              required
              name="present_address"
              label="Present Address *"
              placeholder="Present Address"
              defaultValue={form_info?.present_address}
            />

            {/* <Input label="Email ID" placeholder="somnath@gmail.com" /> */}
            {/* <Input label="Phone Number" placeholder="8787458787" /> */}
          </div>

          <h2 className="text-2xl font-semibold pt-5">
            Information For Emergency situation
          </h2>

          <div className="grid grid-cols-3 gap-x-5 gap-y-3 md:grid-cols-2 sm:grid-cols-1">
            <Input
              name="blood_group"
              label="Blood Group"
              placeholder="A+"
              defaultValue={form_info?.blood_group}
            />
            {/* <Input
              name="allergic_or_medication"
              label="Whether allergic to any medication (Y/N)"
              placeholder="Y / N"
            /> */}

            <div>
              <span className="inline-block font-medium">
                Whether allergic to any medication (Y/N) *
              </span>
              <div className="px-3 border bg-[#e9b9582a] border-gray-400">
                <select
                  name="allergic_or_medication"
                  className="w-full outline-none py-2 bg-transparent"
                  defaultValue={form_info?.rank}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <Input
              required
              name="next_of_kin_name"
              label="Next of kin name *"
              placeholder="Next of kin name"
              defaultValue={form_info?.next_of_kin_name}
            />
            <Input
              required
              name="relation_to_sel"
              label="Relation to sel *"
              placeholder="Relation to sel"
              defaultValue={form_info?.relation_to_sel}
            />
            <Input
              required
              name="emergency_number"
              label="Telephone Contact Nos.in Emergency *"
              placeholder="Emergency Number"
              defaultValue={form_info?.emergency_number}
            />
          </div>

          <h2 className="text-2xl font-semibold pt-5">
            Additionally for canditates of Refresher Courses
          </h2>
          <div className="flex items-start gap-x-5 gap-y-3 flex-wrap *:basis-96 *:flex-grow">
            <Input
              name="number_of_the_cert"
              label="Number of the Cert.which is being refreshed :"
              placeholder="Number of the Cert.which is being refreshed :"
              defaultValue={form_info?.number_of_the_cert}
            />
            <Input
              name="issued_by_institute"
              label="Issued by (name of the Institute) :"
              placeholder="Issued by (name of the Institute) :"
              defaultValue={form_info?.issued_by_institute}
            />
            <Input
              pattern="[0-9]{2}[A-Z]{2}[0-9]{4}"
              title="InDos Number should be in the format: 11EL1234 (2 digits, 2 uppercase letters, 4 digits)"
              name="issued_by_institute_indos_number"
              label="INDoS no (Institute) :"
              placeholder="INDoS no (Institute) :"
              defaultValue={form_info?.issued_by_institute_indos_number}
            />
          </div>
        </div>
      )}

      <SelectedCourseTable />

      <Button
        disabled={isSavingForm}
        isLoading={isSavingForm}
        className="!border flex items-center font-semibold gap-3 !border-gray-400 !bg-[#E9B858] !text-black card-shdow !min-w-60 active:scale-75"
      >
        <span>Continue</span>
        <FaLongArrowAltDown className="-rotate-90" />
      </Button>
    </form>
  );
}
