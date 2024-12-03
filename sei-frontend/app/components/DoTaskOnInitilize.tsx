import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDialog } from "../redux/slice/dialog.slice";

export default function DoTaskOnInitilize() {
  const dispatch = useDispatch();
  useEffect(() => {
    //check is the student login or not
    if (localStorage) {
      const userSelectedInstitute = localStorage.getItem(
        "user-selected-institute"
      );
      if (!userSelectedInstitute) {
        // (async function () {
        //   await removeInfo("open-institute-chooser-dialog");
        // })();
        dispatch(setDialog({ type: "OPEN", dialogKey: "select-our-center" }));
      }
    }
  }, []);
  return <></>;
}
