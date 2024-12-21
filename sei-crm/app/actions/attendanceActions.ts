"use server";

import axios, { AxiosError } from "axios";
import { BASE_API } from "../constant";
import { revalidatePath } from "next/cache";
import { IError } from "@/types";

export const setAttendanceStatus = async (
  employee_id: number,
  status: "Present" | "Absent" | "Half Day" | "Sunday" | "Holiday",
  date: string
) => {
  try {
    await axios.patch(
      `${BASE_API}/hr/attendance/${employee_id}`,
      {
        status,
        date,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    revalidatePath("");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    const err = error as AxiosError<IError>;
    return {
      success: false,
      message: err.response?.data.message,
    };
  }
};
