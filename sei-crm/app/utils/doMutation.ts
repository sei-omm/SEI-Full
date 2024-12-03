import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { BASE_API } from "../constant";

type ParamsType = {
  apiPath: string;
  method: "post" | "put" | "delete" | "patch";
  id?: number;
  formData?: FormData;
  headers?: object;
  onSuccess?: (data: ISuccess<any>) => void;
};

async function submitInformationToServer<T>(params: ParamsType) {
  const response = await axios.request({
    url: `${BASE_API}${params.apiPath}/${params.id ?? ""}`,
    method: params.method,
    data: params.formData,
    headers: params.headers
      ? {...params.headers}
      : {
          "Content-Type": "multipart/form-data",
        },
  });

  return {
    onSuccess: params.onSuccess,
    response: response.data as ISuccess<T>,
  };
}

export const doMutation = <T>() => {
  const { mutate, isLoading } = useMutation(submitInformationToServer<T>, {
    onSuccess: (data) => {
      if (data.onSuccess) {
        data.onSuccess(data.response);
      }
      toast.success(data.response.message);
    },
    onError: (error: AxiosError<IError>) => {
      toast.error(error.response?.data.message);
    },
  });

  return { mutate, isLoading };
};
