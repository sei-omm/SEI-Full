import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { removeInfo } from "../utils/saveInfo";
import { setProfileImage } from "../redux/slice/profileImage.slice";
import { setLoginStatus } from "../redux/slice/loginStatus";

export const useDoLogout = () => {
  const [isLogouting, setIsLogouting] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter();

  const logout = async () => {
    setIsLogouting(true);
    // await removeInfo("login-token");
    // await removeInfo("profile-image");
    await removeInfo("login-info");
    localStorage.clear();
    dispatch(setProfileImage({ image: null }));
    dispatch(setLoginStatus({ status: "logout" }));
    route.push("/");
    setIsLogouting(false);
  };

  return { isLogouting, logout };
};
