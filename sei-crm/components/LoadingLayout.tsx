import Spinner from "./Spinner";

export default function LoadingLayout() {
  return (
    <div className="h-screen w-full flex-center flex-col gap-3">
      <Spinner size="30px" className="text-[#e9b858]"/>
      <h2 className="text-center">Loading..</h2>
    </div>
  );
}
