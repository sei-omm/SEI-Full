"use client";

import Input from "./Input";
import Button from "./Button";
import { FormEvent, useEffect, useState } from "react";
import { BASE_API } from "../constant";
import { IResponse, TMultipleCoursePrice } from "../type";
import SelectedCourseTable from "./SelectedCourseTable";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import axios from "axios";
import { FaLongArrowAltDown } from "react-icons/fa";
import { setDialog } from "../redux/slice/dialog.slice";
import { axiosQuery } from "../utils/axiosQuery";
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/getAuthToken";

export default function ApplyCourseForm() {
  const [userFormInfo, setuserFormInfo] = useState<object | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const dispatch = useDispatch();

  const cartData = useSelector((state: RootState) => state.courseCart);

  const [calclutedPrice, setCalclutedPrice] = useState({
    totalPrice: 0,
    minToPay: 0,
  });

  useQuery<IResponse<TMultipleCoursePrice[]>>({
    queryKey: ["get-cart-courses-info", cartData],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/course/get-multi-batch-price?batch_ids=${cartData
            .map((item) => item.batch_id)
            .join(",")}`
        )
      ).data,
    onSuccess(data) {
      let totalPrice = 0;
      let minToPay = 0;
      data.data.forEach((item) => {
        totalPrice += parseInt(item.total_price.toString());
        minToPay += parseInt(item.minimum_to_pay.toString());
      });
      setCalclutedPrice({ totalPrice, minToPay });
    },
    refetchOnMount: true,
  });

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          batch_ids: cartData.map((item) => item.batch_id).join(","),
          course_ids: cartData.map((item) => item.course_id).join(","),
          institutes: cartData.map((item) => item.institute).join(","),
          isInWaitingLists : cartData.map((item) => item.isInWaitingList).join(",")
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
            <Input
              name="rank"
              label="Rank/Designation"
              placeholder="Rank/Designation"
            />
            {/* <Input label="InDoS No" placeholder="InDoS No" /> */}
            {/* <Input label="Date of Birth *" type="date" /> */}

            <div className="*:block">
              <span className="inline-block font-medium">Nationality *</span>
              <div className="px-3 border bg-[#e9b9582a] border-gray-400">
                <select
                  name="nationality"
                  className="w-full outline-none py-2 bg-transparent"
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
            />
            <Input
              required
              name="present_address"
              label="Present Address *"
              placeholder="Present Address"
            />

            {/* <Input label="Email ID" placeholder="somnath@gmail.com" /> */}
            {/* <Input label="Phone Number" placeholder="8787458787" /> */}
          </div>

          <h2 className="text-2xl font-semibold pt-5">
            Information For Emergency situation
          </h2>

          <div className="grid grid-cols-3 gap-x-5 gap-y-3 md:grid-cols-2 sm:grid-cols-1">
            <Input name="blood_group" label="Blood Group" placeholder="A+" />
            <Input
              name="allergic_or_medication"
              label="Whether allergic to any medication (Y/N)"
              placeholder="Y / N"
            />
            <Input
              required
              name="next_of_kin_name"
              label="Next of kin name *"
              placeholder="Next of kin name"
            />
            <Input
              required
              name="relation_to_sel"
              label="Relation to sel *"
              placeholder="Relation to sel"
            />
            <Input
              required
              name="emergency_number"
              label="Telephone Contact Nos.in Emergency *"
              placeholder="Relation to sel"
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
            />
            <Input
              name="issued_by_institute"
              label="Issued by (name of the Institute) :"
              placeholder="Issued by (name of the Institute) :"
            />
            <Input
              name="issued_by_institute_indos_number"
              label="INDoS no (Institute) :"
              placeholder="INDoS no (Institute) :"
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
