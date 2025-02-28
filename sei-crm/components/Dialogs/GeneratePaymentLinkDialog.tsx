import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { MdOutlineContentCopy } from "react-icons/md";
import { IoMdOpen } from "react-icons/io";
import Button from "../Button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { RootState } from "@/redux/store";
import { LuRefreshCcw } from "react-icons/lu";
// import { getAuthToken } from "@/app/utils/getAuthToken";
import { useRouter } from "next/navigation";
import { useDoMutation } from "@/app/utils/useDoMutation";

export default function GeneratePaymentLinkDialog() {
  const dispatch = useDispatch();
  const route = useRouter();
  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const [paymentLink, setPaymentLink] = useState("");

  const closeDialog = () => {
    route.replace(
      `/dashboard/admission/manage-form?form-id=${extraValue?.form_id}&student-id=${extraValue?.student_id}`
    );
    dispatch(
      setDialog({
        dialogId: "generate-payment-link-dialog",
        type: "CLOSE",
      })
    );
  };

  const { data, error, isFetching, refetch } = useQuery<
    ISuccess<{ token_key: string }>
  >({
    queryKey: "get-payment-link",
    queryFn: async () =>
      (
        await axios.post(
          `${BASE_API}/course/enroll?batch_ids=${extraValue?.batch_ids}&student_id=${extraValue?.student_id}`,
          {
            payment_mode: extraValue?.payment_type, //put anything here
          },
          // {
          //   headers: {
          //     ...getAuthToken(),
          //   },
          // }
        )
      ).data,
    onSuccess(data) {
      setPaymentLink(
        process.env.NEXT_PUBLIC_FRONTEND_BASE +
          "/payment/" +
          data?.data.token_key
      );
    },
  });

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Payment Link Copied");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    }
  };

  const { isLoading: isSendingEmail, mutate } = useDoMutation();
  const handleSendEmail = async () => {
    mutate({
      apiPath: "/payment/link-email",
      method: "post",
      formData: {
        token: data?.data.token_key,
      },
    });
  };

  return (
    <DialogBody preventToClose className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Link</h2>
        <LuRefreshCcw
          onClick={() => refetch()}
          className="cursor-pointer active:scale-90"
          size={18}
          title="Regenerate"
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={1}
        customLoadingTxt="Generating Payment Link...."
      >
        <div className="flex items-center gap-3 w-full">
          <div
            onClick={copyText}
            className="border-[1px] overflow-hidden text-sm flex-grow cursor-pointer rounded-xl border-gray-500 bg-[#e9b9582a] p-3 border-dotted flex-center gap-3 text-gray-500"
          >
            {paymentLink.slice(0, 34)}...
          </div>
          <MdOutlineContentCopy
            onClick={copyText}
            className="cursor-pointer active:scale-90"
          />
          <Link href={paymentLink} target="__blank">
            <IoMdOpen className="cursor-pointer active:scale-90" />
          </Link>
        </div>
      </HandleSuspence>

      <div className="flex items-center justify-between">
        <Button
          disabled={isFetching || isSendingEmail}
          onClick={closeDialog}
          className="!bg-transparent !shadow-none !border !text-gray-800"
        >
          Skip
        </Button>
        <Button
          onClick={handleSendEmail}
          disabled={isFetching || isSendingEmail}
          loading={isSendingEmail}
        >
          Send Link
        </Button>
      </div>
    </DialogBody>
  );
}
