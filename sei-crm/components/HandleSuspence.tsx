import { IError } from "@/types";
import { AxiosError, isAxiosError } from "axios";
import React from "react";

interface IProps<K> {
  isLoading: boolean;
  children: React.ReactNode;
  errorMsg?: string;
  error?: K;
  dataLength?: number;
  noDataMsg?: string;
  customLoading?: React.ReactNode;
  customLoadingTxt?: string;
}

export default function HandleSuspence<K>({
  isLoading,
  children,
  errorMsg,
  error,
  dataLength,
  noDataMsg,
  customLoading,
  customLoadingTxt,
}: IProps<K>) {
  if (isLoading)
    return (
      customLoading ?? (
        <h1 className="text-center text-sm text-gray-500 flex-grow">
          {customLoadingTxt ?? "Loading..."}
        </h1>
      )
    );

  if (errorMsg)
    return (
      <h1 className="text-center text-sm text-gray-500 flex-grow">
        {errorMsg}
      </h1>
    );

  if (error) {
    if (isAxiosError(error)) {
      const err = error as AxiosError<IError>;
      return (
        <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
              {/* <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
                {err.status}
              </h1> */}
              {err.status !== 405 && (
                <p className="mb-4 text-3xl tracking-tight font-bold text-red-600 md:text-4xl dark:text-white">
                  Server Error
                </p>
              )}
              <p className="mb-4 text-lg font-light text-red-400 dark:text-gray-400">
                {err.response?.data.message}
              </p>
              {/* <a
                href="#"
                className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
              >
                Back to Homepage
              </a> */}
            </div>
          </div>
        </section>
      );
    } else {
      return <h1>{error.toString()}</h1>;
    }
  }

  if (dataLength === undefined)
    return (
      <h1 className="text-center text-sm text-gray-500 flex-grow">
        Nothing To Show
      </h1>
    );
  // return <></>;

  if (dataLength === 0)
    return (
      <h1 className="text-center text-sm text-gray-500 flex-grow">
        {noDataMsg ?? "No Data Found"}
      </h1>
    );
  // return <></>;

  return children;
}
