type HandleDataSuspenseProps<T> = {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  children: (data: T) => React.ReactNode;
};

const HandleDataSuspense = <T,>({
  isLoading,
  error,
  data,
  children,
}: HandleDataSuspenseProps<T>) => {
  if (isLoading) {
    return <div>Loading...</div>; // Or a loader component
  }

  if (error) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Something went wrong"}
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>; // Handle case where data is undefined
  }

  return <>{children(data)}</>;
};

export default HandleDataSuspense;
