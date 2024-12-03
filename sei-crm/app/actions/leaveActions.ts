"use server";

import axios, { AxiosError } from "axios";
import { BASE_API } from "../constant";
import { revalidatePath } from "next/cache";
import { IError } from "@/types";

export const setStatus = async (
  leaveID: number,
  status: "success" | "decline",
  employee_id : number,
  leave_from : string,
  leave_to : string
) => {
  try {
    await axios.patch(
      `${BASE_API}/hr/leave/${leaveID}`,
      {
        leave_status: status,
        employee_id,
        leave_from,
        leave_to
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
