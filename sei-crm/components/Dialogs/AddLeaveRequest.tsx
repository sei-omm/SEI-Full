import React from "react";
import DialogBody from "./DialogBody";
import DateInput from "../DateInput";
import TextArea from "../TextArea";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { queryClient } from "@/redux/MyProvider";
import DropDown from "../DropDown";
import { SEI_LEAVES } from "@/app/constant";
// import { TEmployeeLeave } from "@/types";

export default function AddLeaveRequest() {
  // const { extraValue } = useSelector((state: RootState) => state.dialogs);
  // const extraData = extraValue as TEmployeeLeave[] | undefined;

  // const [leavesDropdown, setLeavesDropdown] = useState<
  //   { id: string; name: string; value: number }[]
  // >(() => {
  //   const newValues : any[] = [];

  //   leavesDropdown.forEach(item => {
  //     if(extraData?.[0][item.id as any])
  //   })

  //   return [];
  // });

  const { isLoading, mutate } = useDoMutation();
  const dispatch = useDispatch();

  function handleSubmit(formData: FormData) {
    mutate({
      apiPath: "/employee/leave",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      formData,
      onSuccess: () => {
        dispatch(setDialog({ type: "CLOSE", dialogId: "add-leave-request" }));
        queryClient.invalidateQueries({ queryKey: ["employee-leave-request"] });
      },
    });
  }

  return (
    <DialogBody>
      <form action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DateInput required name="leave_from" label="From *" />
          <DateInput required name="leave_to" label="To *" />
        </div>
        <DropDown
          name="leave_type"
          label="Leave Type *"
          options={SEI_LEAVES.map((item) => ({
            text: item.name,
            value: item.id,
          }))}
        />
        <TextArea
          required
          name="leave_reason"
          label="Reason *"
          placeholder="Type your reason here..."
        />
        <Button loading={isLoading} disabled={isLoading}>
          Submit
        </Button>
        <p className="text-xs">
          10 days of Casual Leave in a calendar year, 10 days of Sick Leave (SL)
          in a calendar year, 84 days of paid Maternity Leave is allowed to
          females who have to deliver a child
        </p>
      </form>
    </DialogBody>
  );
}
