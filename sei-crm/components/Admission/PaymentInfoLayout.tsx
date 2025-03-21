import React, { useState } from "react";
import { LiaMoneyCheckSolid } from "react-icons/lia";
import Button from "../Button";
import { PiMoney } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import Link from "next/link";
import { IoPrint } from "react-icons/io5";
import { BiMailSend } from "react-icons/bi";
import TagsBtn from "../TagsBtn";
import { TEnrollCourses, TPaymentInfo } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { MdAvTimer } from "react-icons/md";
import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Spinner from "../Spinner";

interface IProps {
  paymentsInfo?: TPaymentInfo;
  form_id: string;
  student_id: number;
  student_course_info: TEnrollCourses[] | undefined;
}

export default function PaymentInfoLayout({
  paymentsInfo,
  form_id,
  student_id,
  student_course_info,
}: IProps) {
  const dispatch = useDispatch();
  const [clickedPaymentId, setClickedPaymentId] = useState("");

  const handlePaymentDialogBtn = (
    btnType: "add-payment" | "add-misc-payment"
  ) => {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: "admission-payment",
        extraValue: {
          payment_type: btnType,
          total_paid: paymentsInfo?.total_paid,
          total_due: paymentsInfo?.total_due,
          student_course_info: student_course_info,
        },
      })
    );
  };

  const pInfo = !paymentsInfo
    ? []
    : paymentsInfo.payments.map((item) => [
        item.created_at,
        item.payment_id,
        item.paid_amount,
        item.payment_type,
        item.mode,
        item.remark,
        item.misc_payment,
        item.misc_remark,
        item.discount_amount,
        item.discount_remark,
        item.order_id,
        "actionBtn",
      ]);

  const tableDatas: { heads: string[]; body: (string | number | null)[][] } = {
    heads: [
      "Date",
      "Payment ID",
      "Payment",
      "Type",
      "Mode",
      "Remark",
      "Misc Payment",
      "Misc Remark",
      "Discount",
      "Discount Remark",
      "Online Order Id",
      "Action",
    ],
    body: pInfo,
  };

  const { isLoading, mutate } = useDoMutation();
  const handleSendReceiptEmail = (payment_id: string) => {
    if (isLoading) return;

    if (!confirm("Are you sure you want to send receipt to email")) return;

    setClickedPaymentId(payment_id);
    mutate({
      apiPath: "/receipt/payment",
      method: "post",
      formData: {
        payment_id: payment_id,
        form_id,
        student_id,
      },
    });
  };

  return (
    <div className="p-10 w-full border card-shdow rounded-3xl flex items-start flex-col gap-5">
      <h2 className="text-2xl font-semibold">Manage Payments</h2>

      <div className="flex items-center gap-x-10 gap-y-4 flex-wrap *:flex *:items-center *:gap-2">
        <span className="font-semibold">
          <PiMoney />
          Course Fee : ₹{paymentsInfo?.total_fee}
        </span>
        {/* <span className="font-semibold">
          <RiDiscountPercentLine />
          Discount Applied : ₹0
        </span> */}
        {/* <span className="font-semibold">
          <LiaMoneyCheckSolid />
          Total Course Fee : ₹{paymentsInfo?.course_fee}
        </span> */}

        <span className="font-semibold">
          <MdAvTimer />
          Due Course Fee : ₹{paymentsInfo?.total_due}
        </span>

        <span className="font-semibold">
          <LiaMoneyCheckSolid />
          {/* Total Paid : ₹{paymentsInfo?.total_paid} */}
          Total Course Fees Paid : ₹{paymentsInfo?.total_paid}
        </span>

        <span className="font-semibold">
          <LiaMoneyCheckSolid />
          Total Misc Payment : ₹{paymentsInfo?.total_misc_payment}
        </span>

        <span className="font-semibold">
          <LiaMoneyCheckSolid />
          Total Discount : ₹{paymentsInfo?.total_discount}
        </span>

        <span className="font-semibold">
          <PiMoney />
          Total Fees : ₹{paymentsInfo?.total_fees}
        </span>

        {/* <span className="font-semibold">
          <MdAvTimer />
          Total Due Fees : ₹{paymentsInfo?.total_due_fees}
        </span> */}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => handlePaymentDialogBtn("add-payment")}
          type="button"
        >
          Manage Course Payments
        </Button>
        <Button
          onClick={() => handlePaymentDialogBtn("add-misc-payment")}
          type="button"
        >
          Manage Misc Payments
        </Button>
        <Button
          onClick={() =>
            dispatch(
              setDialog({ type: "OPEN", dialogId: "add-discount-dialog" })
            )
          }
          type="button"
        >
          Add Discount
        </Button>
      </div>

      <div className="w-full *:block">
        <span className="font-semibold text-gray-500">Payment History</span>

        {!paymentsInfo || paymentsInfo.payments.length === 0 ? (
          <span className="text-xs text-gray-400">
            no payment history avilable
          </span>
        ) : (
          <div className="max-w-fit overflow-hidden">
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
              <table className="min-w-max w-full table-auto">
                <thead className="uppercase w-full border-b border-gray-100">
                  <tr>
                    {tableDatas.heads.map((item) => (
                      <th
                        className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                        key={item}
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableDatas.body.map((itemArray, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-100 group/bodyitem"
                    >
                      {itemArray.map((value, columnIndex) => (
                        <td
                          className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                          key={value}
                        >
                          {
                            <span className="line-clamp-1 inline-flex gap-x-3">
                              {value === "actionBtn" &&
                              paymentsInfo.payments[rowIndex].discount_amount <=
                                0 ? (
                                <div className="flex-center gap-4">
                                  <Link
                                    href={`${BASE_API}/receipt/payment?form_id=${form_id}&student_id=${student_id}&payment_id=${paymentsInfo.payments[rowIndex].payment_id}`}
                                    target="_blank"
                                    title="Print Form"
                                  >
                                    <IoPrint title="Print Receipt" size={18} />
                                  </Link>
                                  {isLoading &&
                                  clickedPaymentId ===
                                    paymentsInfo.payments[rowIndex]
                                      .payment_id ? (
                                    <Spinner size="13px" />
                                  ) : (
                                    <div
                                      onClick={() =>
                                        handleSendReceiptEmail(
                                          paymentsInfo.payments[rowIndex]
                                            .payment_id
                                        )
                                      }
                                      className="cursor-pointer"
                                      title="Send Receipt To Email"
                                    >
                                      <BiMailSend size={18} />
                                    </div>
                                  )}
                                </div>
                              ) : value === "Approved" ? (
                                <TagsBtn type="SUCCESS">Approved</TagsBtn>
                              ) : value === "Cancelled" ? (
                                <TagsBtn type="FAILED">Cancelled</TagsBtn>
                              ) : value === "Pending" ? (
                                <TagsBtn type="PENDING">Pending</TagsBtn>
                              ) : columnIndex === 0 ? (
                                beautifyDate(value as string)
                              ) : columnIndex === 2 ? (
                                parseFloat(`${value}`)
                              ) : value === "actionBtn" ? (
                                ""
                              ) : (
                                value
                              )}
                            </span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
