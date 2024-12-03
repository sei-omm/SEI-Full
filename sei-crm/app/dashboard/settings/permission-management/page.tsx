import Button from "@/components/Button";
import Input from "@/components/Input";
import { MdOutlineDeleteOutline } from "react-icons/md";

export default function page() {
  return (
    <div className="size-full py-5 space-y-10">
      <div className="flex items-end gap-x-6 mx-auto">
        <Input
          wrapperCss="flex-grow"
          type="email"
          label="Add Team Mamber"
          placeholder="somnath.gupta@ommdigitalsoluction.com"
        />
        <Button className="py-5 mb-2">Add Mamber</Button>
      </div>

      <div className="space-y-5">
        <h3 className="font-semibold">All Members</h3>

        <ul className="w-full space-y-6">
          {[1, 2, 3, 4].map((mamber, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center  gap-x-3">
                <div className="size-10 bg-gray-200 rounded-[50%] shadow-lg"></div>
                <div>
                  <h4 className="font-semibold text-sm">Somnath Gupta</h4>
                  <h5 className="text-gray-500 text-sm">
                    somnath.gupta@ommdigitalsoluction.com
                  </h5>
                </div>
              </div>

              <select className="text-sm font-semibold outline-none cursor-pointer">
                {["None", "Hiring Resources", "Admin"].map((item, index) => (
                  <option
                    selected={index === 0}
                    key={item}
                    className="text-sm font-semibold cursor-pointer"
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              {/* member controller icons */}
              <div className="flex items-center gap-x-5">
                <MdOutlineDeleteOutline
                  title="Remove Member"
                  size={20}
                  className="cursor-pointer active:scale-90"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
