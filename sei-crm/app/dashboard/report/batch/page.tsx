// "use client";

// import Button from "@/components/Button";
// import DateInput from "@/components/DateInput";
// import DropDown from "@/components/DropDown";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function page() {
//   const searchParams = useSearchParams();
//   const route = useRouter();

//   function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     const urlSearchParams = new URLSearchParams();
//     const formData = new FormData(event.currentTarget);
//     formData.entries().forEach(([key, value]) => {
//       urlSearchParams.set(key, value.toString());
//     });

//     route.push("/dashboard/report/dgs?" + urlSearchParams.toString());
//     // refetch();
//   }
//   return (
//     <div className="space-y-10">
//       <form
//         onSubmit={handleFormSubmit}
//         className="flex items-end gap-5 *:flex-grow"
//       >
//         <DropDown
//           name="institute"
//           label="Institute"
//           options={[
//             { text: "Kolkata", value: "Kolkata" },
//             { text: "Faridabad", value: "Faridabad" },
//           ]}
//           defaultValue={searchParams.get("institute")}
//         />

//         <DropDown
//           name="course_type"
//           label="Course Type"
//           options={[
//             { text: "DGS Approved", value: "DGS Approved" },
//             { text: "Value Added", value: "Value Added" },
//           ]}
//           defaultValue={searchParams.get("course_type")}
//         />

//         <DropDown
//           name="course_id"
//           label="Course"
//           options={
//             dropDownCoursesInfo?.data.map((item) => ({
//               text: item.course_name,
//               value: item.course_id,
//             })) || []
//           }
//           defaultValue={selectedCourse}
//         />

//         <DateInput
//           required
//           label="Batch Date"
//           name="batch_date"
//           date={searchParams.get("batch_date")}
//         />

//         <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
//           <Button className="">Search</Button>
//         </div>
//       </form>
//     </div>
//   );
// }

"use client";

export default function page() {
  return (
    <div>page</div>
  )
}
