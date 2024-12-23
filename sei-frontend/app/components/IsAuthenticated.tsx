"use client";

import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { useDispatch } from "react-redux";
import { setDialog } from "../redux/slice/dialog.slice";
import UnAuthorizedPage from "./UnAuthorizedPage";

interface IProps {
  children: React.ReactNode;
}

export default function IsAuthenticated({ children }: IProps) {
  const { isAuthenticated } = useIsAuthenticated();
  const dispatch = useDispatch();

  if (isAuthenticated !== null && isAuthenticated === false) {
    dispatch(setDialog({ dialogKey: "student-login-dialog", type: "OPEN" }));
    return <UnAuthorizedPage />;
  }

  return children;
}
