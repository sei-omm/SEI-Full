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
    console.log(error);
    return <h1>{error.toString()}</h1>;
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
