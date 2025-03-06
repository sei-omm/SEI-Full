import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { TOccupancyReport } from "@/types";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {
  data: TOccupancyReport[];
}

export default function OccupancyChat({ data }: IProps) {
  const [occupancyChatData, setOccupancyChatData] = useState<any | null>(null);
  const [feesChatData, setFeesChatData] = useState<any | null>(null);
  const [] = useState<any | null>(null);

  useEffect(() => {
    if (data.length !== 0) {
      const occupencyChatLabels: any[] = [];
      const occupencyChatDatas: any[] = [];

      const feesChatData: any[] = [];

      data.forEach((item) => {
        occupencyChatLabels.push(item.course_code);
        occupencyChatDatas.push(item.occupancy_percentage);

        feesChatData.push(item.after_discount_fee_collection);
      });

      const occupancyChatObj = {
        labels: occupencyChatLabels, // Labels for the X-axis
        datasets: [
          {
            label: "Occupency %", // Label for the dataset
            data: occupencyChatDatas, // Data points
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              // "rgba(54, 162, 235, 0.2)",
              // "rgba(255, 206, 86, 0.2)",
              // "rgba(75, 192, 192, 0.2)",
              // "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              // "rgba(54, 162, 235, 1)",
              // "rgba(255, 206, 86, 1)",
              // "rgba(75, 192, 192, 1)",
              // "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1, // Border thickness
          },
        ],
      };

      const feesAfterDiscountChatObj = {
        labels: occupencyChatLabels, // Labels for the X-axis
        datasets: [
          {
            label: "Fees Collection After Discount", // Label for the dataset
            data: feesChatData, // Data points
            backgroundColor: [
              //   "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              // "rgba(255, 206, 86, 0.2)",
              // "rgba(75, 192, 192, 0.2)",
              // "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              //   "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              // "rgba(255, 206, 86, 1)",
              // "rgba(75, 192, 192, 1)",
              // "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1, // Border thickness
          }
        ],
      };
      setOccupancyChatData(occupancyChatObj);
      setFeesChatData(feesAfterDiscountChatObj);
    }
  }, [data]);

  return (
    <div className="flex items-start *:flex-grow *:basis-44 gap-10">
      {occupancyChatData === null ? null : (
        <div>
          <Bar data={occupancyChatData} />
        </div>
      )}
      {feesChatData === null ? null : (
        <div>
          <Bar data={feesChatData} />
        </div>
      )}
    </div>
  );
}
