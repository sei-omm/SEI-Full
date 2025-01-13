import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const axiosQuery = async <E, D>(options: AxiosRequestConfig) => {
  let response: D | null = null;
  let error: E | null = null;
  let isCancel : boolean = false;

  try {
    const { data } = await axios.request<AxiosResponse<D>>(options);
    error = null;
    response = data as D;
  } catch (err) {
    error = (err as AxiosError<E>).response?.data as E;
    isCancel = axios.isCancel(error);
    response = null;
  } finally {
    return { response, error, isCancel };
  }
};