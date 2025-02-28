import { BASE_API } from "@/app/constant";
// import { getAuthToken } from "@/app/utils/getAuthToken";
import axios from "axios";

type TSendNotification = {
  notification_title: string;
  notification_description: string;
  notification_type: "role_base" | "private";
  notification_link?: string;
  employee_ids?: number[];
  employee_roles?: string[];
};

export const sendNoification = async ({
  notification_title,
  notification_description,
  notification_type,
  employee_ids,
  employee_roles,
  notification_link,
}: TSendNotification) => {
  return axios.post(
    `${BASE_API}/notification/create-send`,
    {
      notification_title,
      notification_description,
      notification_type,
      notification_link,
      employee_ids,
      employee_roles,
    },
    // {
    //   headers: {
    //     ...getAuthToken(),
    //   },
    // }
  );
};
