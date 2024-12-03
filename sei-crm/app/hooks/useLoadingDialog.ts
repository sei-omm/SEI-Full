import { setDialog } from "@/redux/slices/dialogs.slice";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

export const useLoadingDialog = () => {
  const dispatch = useDispatch();

  const openDialog = useCallback(() => {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
  }, []);

  const closeDialog = useCallback(() => {
    dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
  }, []);

  return { openDialog, closeDialog };
};
