import Image from "next/image";
import Link from "next/link";

interface IProps {
  params: {
    employeeID: string;
  };
}

export default function page({ params }: IProps) {
  const employeeID = params.employeeID;

  return (
    <div className="p-8">
      <h1 className="text-sm font-semibold text-gray-500 space-x-2">
        <Link href={"/dashboard"}>Dashboard</Link> <span>/</span>
        <span>Employee</span>
        <span>/</span>
        <span>{employeeID}</span>
      </h1>

      {/* Employee Profile Info */}
      <div className="grid grid-cols-2 py-7">
        <div className="flex items-start gap-6">
          <div className="size-20 bg-slate-200 rounded-full overflow-hidden">
            <Image
              className="size-full object-cover"
              src={"/employee-sample.jpg"}
              alt="Profile Image"
              height={150}
              width={150
                
              }
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-semibold">Somnath Gupta</h2>
              <h3 className="text-sm text-gray-600">Full Stack Developer</h3>
            </div>

            <div className="space-y-1">
              <h5 className="font-[600] text-xs">Employee ID : {employeeID}</h5>
              <h6 className="text-gray-500 text-xs">
                Date of Join : 1st Jan 2023
              </h6>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
}
