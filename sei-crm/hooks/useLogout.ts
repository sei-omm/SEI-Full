import { BASE_API } from "@/app/constant";
import { removeInfo } from "@/app/utils/saveInfo";
import { setDialog } from "@/redux/slices/dialogs.slice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export const useLogout = () => {
  const dispatch = useDispatch();
  const route = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleLogoutBtn() {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
    startTransition(async () => {
      // await removeInfo("login-token");

      try {
        await axios.post(`${BASE_API}/employee/logout`);
        await removeInfo("employee-info", {
          inCookie: false,
          inLocalstorage: true,
        });
        await removeInfo("permissions", {
          inCookie: false,
          inLocalstorage: true,
        });
        // await removeInfo("refreshToken");
        dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
        route.push("/auth/login");
      } catch (error) {
        toast.error("Unable To Logout. Try Again");
      }
    });
  }

  return { isPending, handleLogoutBtn };
};
