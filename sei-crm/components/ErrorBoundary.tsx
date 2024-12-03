import { IError } from "@/types";
import { AxiosError } from "axios";

interface IProps {
  children: React.ReactNode;
  error: AxiosError<IError> | null;
}

export default function ErrorBoundary({ children, error }: IProps) {
  return (
    <>
      {error ? (
        <div>
          <h2 className="text-center pt-10 text-lg font-semibold tracking-widest">
            {error.response?.data.message}
          </h2>
        </div>
      ) : (
        children
      )}
    </>
  );
}
