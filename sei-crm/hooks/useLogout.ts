import { removeInfo } from "@/app/utils/saveInfo";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDispatch } from "react-redux";

export const useLogout = () => {
  const dispatch = useDispatch();
  const route = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleLogoutBtn() {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
    startTransition(async () => {
      // await removeInfo("login-token");
      await removeInfo("employee-info", {
        inCookie: false,
        inLocalstorage: true,
      });
      await removeInfo("refreshToken");

      dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
      route.push("/auth/login");
    });
  }

  return { isPending, handleLogoutBtn };
};
