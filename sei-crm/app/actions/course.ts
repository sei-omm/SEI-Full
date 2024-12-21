"use server";

import { revalidatePath } from "next/cache";
import { BASE_API } from "../constant";
import axios, { AxiosError } from "axios";
import { IError } from "@/types";

export async function uploadCourse(formData: FormData) {
  "use server";

  try {
     await axios.post(BASE_API + "/course", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    revalidatePath("");
  } catch (error) {
    const err = error as AxiosError<IError>;
    console.log(err);
  }
}
