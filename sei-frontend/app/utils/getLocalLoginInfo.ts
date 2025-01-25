type TLocalLoginInfo = {
  enrolled_courses: { batch_id: number; start_date: string }[];
  profile_image: string | null;
  token: string;
};

export const getLocalLoginInfo = () => {
  const loginInfo = localStorage.getItem("login-info");
  if (loginInfo !== null) {
    const parsedData = JSON.parse(loginInfo) as TLocalLoginInfo;

    return parsedData;
  }

  return null;
};

export const setLocalLoginInfo = (payload: TLocalLoginInfo) => {
  localStorage.setItem("login-info", JSON.stringify(payload));
};
