interface IProps {
  isLoading: boolean;
  children: React.ReactNode;
  errorMsg?: string;
}

export default function HandleSuspence({
  isLoading,
  children,
  errorMsg,
}: IProps) {
  return (
    <>
      {isLoading ? (
        <h1>Loading..</h1>
      ) : errorMsg ? (
        <h1 className="text-center text-sm text-gray-500">{errorMsg}</h1>
      ) : (
        children
      )}
    </>
  );
}
