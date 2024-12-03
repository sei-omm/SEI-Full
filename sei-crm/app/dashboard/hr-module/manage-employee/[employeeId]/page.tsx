import EmployeeInfo from "@/components/EmployeeInfo";

interface IProps {
  params: {
    employeeId: number | "add-employee" | "add-faculty";
  };
}

export default function page({ params }: IProps) {
  const idOfEmployee = params.employeeId;

  return (
    <div className="size-full py-5">
      <EmployeeInfo employeeID={idOfEmployee}/>
    </div>
  );
}
