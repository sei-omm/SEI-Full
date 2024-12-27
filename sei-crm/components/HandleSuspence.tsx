interface IProps<K> {
  isLoading: boolean;
  children: React.ReactNode;
  errorMsg?: string;
  error?: K;
  dataLength?: number;
}

export default function HandleSuspence<K>({
  isLoading,
  children,
  errorMsg,
  error,
  dataLength,
}: IProps<K>) {
  if (isLoading)
    return <h1 className="text-center text-sm text-gray-500">Loading...</h1>;

  if (errorMsg)
    return <h1 className="text-center text-sm text-gray-500">{errorMsg}</h1>;

  if (error) return <h1>{error.toString()}</h1>;

  if (dataLength === undefined)
    return (
      <h1 className="text-center text-sm text-gray-500">Nothing To Show</h1>
    );
    // return <></>;

  if (dataLength === 0)
    return <h1 className="text-center text-sm text-gray-500">No Data Found</h1>;
    // return <></>;

  return children;
}
