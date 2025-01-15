"use client";

import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TInventoryStock } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { IoLayersOutline } from "react-icons/io5";
import { BiLayerMinus } from "react-icons/bi";
import { GiSandsOfTime } from "react-icons/gi";
import { PiMoney } from "react-icons/pi";
import { IoMdEye } from "react-icons/io";
import MultiInventoryItemStockForm from "../SingleLineForms/MultiInventoryItemStockForm";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

interface IProps {
  item_id: number;
}

export default function ProductStockInfo({ item_id }: IProps) {
  const dispatch = useDispatch();
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Added Stock",
      "Item Consumed",
      "Purchased Date",
      "Remark",
      "Action",
    ],
    body: [],
  });

  const { isFetching, error, data } = useQuery<
    ISuccess<{
      stock_info: TInventoryStock[];
      stock_calcluction: {
        total_stock: number;
        total_item_consumed: number;
        remain_stock: number;
        total_spend: number;
      };
    }>
  >({
    queryKey: "get-item-stock-all-info",
    queryFn: async () =>
      (await axios.get(BASE_API + "/inventory/item-stock/get-all/" + item_id))
        .data,
    onSuccess(data) {
      const newTableData = { ...tableDatas };
      newTableData.body = data.data.stock_info.map((item) => [
        item.opening_stock.toString(),
        item.item_consumed.toString(),
        beautifyDate(item.purchase_date),
        item.remark,
        "actionBtn",
      ]);

      setTableDatas(newTableData);
    },
    refetchOnMount: true,
  });

  function handleStockDialog(stockId: "add" | number) {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: "inventory-stock-dialog",
        extraValue: {
          stock_id: stockId,
          item_id,
        },
      })
    );
  }

  return (
    <div className="bg-white items-start p-10 border card-shdow rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-center gap-2 font-semibold">
          <IoLayersOutline />
          <span>Total Stock : {data?.data.stock_calcluction.total_stock}</span>
        </div>

        <div className="flex-center gap-2 font-semibold">
          <BiLayerMinus />
          <span>
            Stock Consumed : {data?.data.stock_calcluction.total_item_consumed}
          </span>
        </div>

        <div className="flex-center gap-2 font-semibold">
          <GiSandsOfTime />
          <span>
            Remain Stock : {data?.data.stock_calcluction.remain_stock}
          </span>
        </div>

        <div className="flex-center gap-2 font-semibold">
          <PiMoney />
          <span>Total Spend : ₹{data?.data.stock_calcluction.total_spend}</span>
        </div>
      </div>
      {/* <div className="flex items-center gap-6">
        <Button
          onClick={() => handleStockDialog("add")}
          type="button"
          className="flex-center gap-2"
        >
          <MdOutlineAdd size={18} />
          Add New Stock
        </Button>
        <Button
          onClick={() =>
            dispatch(
              setDialog({
                dialogId: "inventory-stock-consume-dialog",
                type: "OPEN",
                extraValue: {
                  remain_stock: data?.data.stock_calcluction.remain_stock,
                  item_id,
                },
              })
            )
          }
          type="button"
          className="flex-center gap-2"
        >
          <BiLayerMinus size={18} />
          Consume Stock
        </Button>
      </div> */}

      <MultiInventoryItemStockForm
        item_id={item_id}
        remain_stock={data?.data.stock_calcluction.remain_stock}
      />

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={tableDatas.body.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <h2 className="font-semibold text-gray-500 px-5 pt-3 text-sm">
              History Of Added Stocks
            </h2>
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
                    {itemArray.map((value) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <IoMdEye
                              onClick={() =>
                                handleStockDialog(
                                  data?.data?.stock_info?.[rowIndex]
                                    ?.stock_id as number
                                )
                              }
                              className="cursor-pointer"
                              size={18}
                            />
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
    </div>
  );
}
