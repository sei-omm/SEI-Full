import React from "react";
import DialogBody from "./DialogBody";
import Button from "../Button";
import TimePicker from "../TimePicker";

export default function ManageAttendanceDialog() {
  // const { extraValue } = useSelector((state: RootState) => state.dialogs);

  //extraValue -> edit-employee-attendance || add-new-employee-attendance

  const onCheckInTimePicked = () => {};

  const onCheckOutTimePicked = () => {};

  return (
    <DialogBody>
      <h2 className="text-xl font-semibold pt-2">Manage Employee Attendance</h2>

      <form action="" className="space-y-3">
        <select className="outline-none border-2 border-gray-200 rounded-lg w-full text-sm px-4 py-3">
          <option value="Active">Active</option>
          <option value="Leave">Leave</option>
          <option value="Half Day Leave">Half Day Leave</option>
        </select>
        <TimePicker label="Check In Time" onPicked={onCheckInTimePicked} />
        <TimePicker label="Check Out Time" onPicked={onCheckOutTimePicked} />
        <Button>Submit</Button>
      </form>
    </DialogBody>
  );
}
