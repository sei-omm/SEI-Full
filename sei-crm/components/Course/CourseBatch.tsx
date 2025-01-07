import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import TagsBtn from "../TagsBtn";
import Button from "../Button";
import { CgAdd } from "react-icons/cg";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { useQuery } from "react-query";
import axios from "axios";
import HandleSuspence from "../HandleSuspence";
import { BASE_API } from "@/app/constant";
import { ICourse, ISuccess, TBatches } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import Pagination from "../Pagination";
import { useSearchParams } from "next/navigation";

// const tableDatas = {
//   heads: ["Start Date", "End Date", "Visibility", "Action"],
//   body: [["12 Oct 2024", "13 Oct 2024", "Public", "actionBtn"]],
// };

interface IProps {
  courseId: number;
}

export default function CourseBatch({ courseId }: IProps) {
  const [tableDatas, setTableDatas] = useState({
    heads: ["Start Date", "End Date", "Visibility", "Action"],
    body: [[]],
  });

  const searchParams = useSearchParams();

  const { data, isFetching, refetch } = useQuery<ISuccess<TBatches[]>>({
    queryKey: ["get-course-batches"],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/course/batch/${courseId}?${searchParams.toString()}`
        )
      ).data,

    onSuccess(data) {
      const oldTableInfo = { ...tableDatas };
      oldTableInfo.body = data.data.map((item) => [
        item.start_date,
        item.end_date,
        item.visibility,
        "actionBtn",
      ]) as any;
      setTableDatas(oldTableInfo);
    },
    refetchOnMount: true,
  });

  const dispatch = useDispatch();
  function handleBatchDialog(btnType: "add" | "update", ifUpdateIndex: number) {
    const extraotherValueForUpdate: any = {};
    if (btnType === "update") {
      extraotherValueForUpdate.batch_id = data?.data[ifUpdateIndex].batch_id;
      extraotherValueForUpdate.start_date =
        data?.data[ifUpdateIndex].start_date;
      extraotherValueForUpdate.end_date = data?.data[ifUpdateIndex].end_date;
      extraotherValueForUpdate.batch_fee = data?.data[ifUpdateIndex].batch_fee;
      extraotherValueForUpdate.min_to_pay =
        data?.data[ifUpdateIndex].min_pay_percentage;
      extraotherValueForUpdate.batch_total_seats =
        data?.data[ifUpdateIndex].batch_total_seats;
      extraotherValueForUpdate.batch_reserved_seats =
        data?.data[ifUpdateIndex].batch_reserved_seats;
      extraotherValueForUpdate.visibility =
        data?.data[ifUpdateIndex].visibility;
    } else {
      const courseDATA = queryClient.getQueryData(
        "get-course-with-id"
      ) as ISuccess<ICourse>;
      extraotherValueForUpdate.batch_fee = courseDATA.data.course_fee;
      extraotherValueForUpdate.batch_total_seats = courseDATA.data.total_seats;
      extraotherValueForUpdate.batch_reserved_seats =
        courseDATA.data.total_seats - courseDATA.data.remain_seats;
      extraotherValueForUpdate.min_to_pay = courseDATA.data.min_pay_percentage;
    }

    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: "manage-course-batch",
        extraValue: {
          btnType: btnType,
          course_id: courseId,
          ...extraotherValueForUpdate,
        },
      })
    );
  }

  const { mutate, isLoading } = useDoMutation();
  const handleBatchDeleteBtn = (rowIndex: number) => {
    if (!confirm("Are you sure you want to delete this batch ?")) {
      return;
    }
    mutate({
      apiPath: "/course/batch",
      method: "delete",
      id: data?.data[rowIndex].batch_id,
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <div className="p-10 border card-shdow rounded-3xl">
      <h2 className="text-2xl font-semibold pb-6">
        Course Batch (Course Scheduling)
      </h2>

      <div className="w-full flex items-center justify-end">
        <Button
          onClick={() => handleBatchDialog("add", -1)}
          className="flex-center gap-2"
        >
          <CgAdd />
          Add New Batch
        </Button>
      </div>

      {/* Table */}
      <HandleSuspence
        // errorMsg={data?.data.length === 0 ? "No Data Found" : ""}
        dataLength={data?.data.length}
        isLoading={isFetching}
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl mt-5">
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
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                  {itemArray.map((value, columnIndex) => (
                    <td
                      className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                      key={columnIndex}
                    >
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {value === "actionBtn" ? (
                          <div className="flex-center gap-4 *:cursor-pointer">
                            <CiEdit
                              onClick={() =>
                                handleBatchDialog("update", rowIndex)
                              }
                              size={18}
                            />
                            <Button
                              disabled={isLoading}
                              spinnerSize="15px"
                              onLoadingRemoveContent={true}
                              loading={isLoading}
                              className="!p-0 !bg-transparent !text-black"
                            >
                              <MdDeleteOutline
                                onClick={() => handleBatchDeleteBtn(rowIndex)}
                                size={18}
                              />
                            </Button>
                          </div>
                        ) : value === "Public" ? (
                          <TagsBtn type="SUCCESS">Active</TagsBtn>
                        ) : value === "Private" ? (
                          <TagsBtn type="FAILED">Private</TagsBtn>
                        ) : value === "Over" ? (
                          <TagsBtn type="PENDING">Completed</TagsBtn>
                        ) : columnIndex === 0 || columnIndex === 1 ? (
                          beautifyDate(value)
                        ) : (
                          value
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleSuspence>
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
