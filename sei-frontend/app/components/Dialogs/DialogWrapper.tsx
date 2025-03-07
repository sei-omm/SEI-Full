"use client";

import { RootState } from "@/app/redux/store";
import { useSelector } from "react-redux";
import ApplyJobDialog from "./ApplyJobDialog";
import SLogin from "./SLogin";
import SRegister from "./SRegister";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import NoticeDialog from "./NoticeDialog";
import Otp from "./Otp";
import SelectOurCenter from "./SelectOurCenter";
import ProcessPaymentDialog from "./ProcessPaymentDialog";
import EditIndosNumberDialog from "./EditIndosNumberDialog";
import UploadDocumentsDialog from "./UploadDocumentsDialog";
import LibraryMobileFilterDialog from "./LibraryMobileFilterDialog";

const dialogs = new Map<string, React.ReactNode>();
dialogs.set("apply-job-dialog", <ApplyJobDialog />);
dialogs.set("student-login-dialog", <SLogin />);
dialogs.set("student-register-dialog", <SRegister />);
dialogs.set("otp", <Otp />);
dialogs.set("forgot-password-dialog", <ForgotPasswordDialog />);
dialogs.set("select-our-center", <SelectOurCenter />);
dialogs.set("open-process-payment-dialog", <ProcessPaymentDialog />);

dialogs.set("notice-dialog", <NoticeDialog />);
dialogs.set("edit-indos-num-dialog", <EditIndosNumberDialog />);
dialogs.set("upload-documents-dialog", <UploadDocumentsDialog />);
dialogs.set("mobile-library-filter", <LibraryMobileFilterDialog />);

export default function DialogWrapper() {
  const { dialogKey, type } = useSelector((state: RootState) => state.dialog);

  return (
    <div
      className={`h-screen w-screen fixed z-[999] ${
        type === "OPEN" ? "block" : "hidden"
      }`}
    >
      {dialogs.get(dialogKey)}
    </div>
  );
}
