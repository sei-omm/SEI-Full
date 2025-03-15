"use client";

import { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import MailGunApiSetupDialog from "./MailGunApiSetupDialog";
import GmailsmtpSetupDialog from "./GmailsmtpSetupDialog";
import LoginWIthFacebookDialog from "./LoginWIthFacebookDialog";
import LoginWithGoogleDialog from "./LoginWithGoogleDialog";
import ContactsColumnsDialog from "./ContactsColumnsDialog";
import AddContactsDialog from "./AddContactsDialog";
import AddEmployee from "./AddEmployee";
import ManageAttendanceDialog from "./ManageAttendanceDialog";
import ProgressDialog from "./ProgressDialog";
import AdmissionPaymentDialog from "./AdmissionPaymentDialog";
import ManageCourseBatchDialog from "./ManageCourseBatchDialog";
import UploadDocumentsDialog from "./UploadDocumentsDialog";
import StudentUploadedDocDialog from "./StudentUploadedDocDialog";
import RenameFileOrFolder from "./RenameFileOrFolder";
import AddFolder from "./AddFolder";
import ChooseFilesDialog from "./ChooseFilesDialog";
import AddInventoryStockDialog from "./AddInventoryStockDialog";
import ConsumeStockDialog from "./ConsumeStockDialog";
import FacultyAssignCoursesDialog from "./FacultyAssignCoursesDialog";
import AddDiscountDialog from "./AddDiscountDialog";
import AddLeaveRequest from "./AddLeaveRequest";
import DesignationDialog from "./DesignationDialog";
import DepartmentAndDesignation from "./DepartmentAndDesignation";
import AddMultipleVendor from "./AddMultipleVendor";
import AssignAssetDialog from "./AssignAssetDialog";
import RefundFormDialog from "./RefundFormDialog";
import GeneratePaymentLinkDialog from "./GeneratePaymentLinkDialog";
import AddInventoryItemStock from "./AddInventoryItemStock";
import InductionTrainingForm from "./Tranning/InductionTrainingForm";
import SkillEnhancementForm from "./Tranning/SkillEnhancementForm";
import TrainingRequirement from "./Tranning/TrainingRequirement";
import ViewRequirementDetailsDialog from "./Tranning/ViewRequirementDetailsDialog";
import ViewPmsHistoryDialog from "./ViewPmsHistoryDialog";
import IssueBookToStudent from "./IssueBookToStudent";
import AssignPermissionDialog from "./AssignPermissionDialog";

type DivType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const dialogs = [
  {
    id: "add-employee",
    component: <AddEmployee />,
  },
  {
    id: "manage-employee-attendance",
    component: <ManageAttendanceDialog />,
  },
  {
    id: "progress-dialog",
    component: <ProgressDialog />,
  },
  {
    id: "mail-gun",
    component: <MailGunApiSetupDialog />,
  },
  {
    id: "gmail-smtp-gun",
    component: <GmailsmtpSetupDialog />,
  },
  {
    id: "login-with-facebook",
    component: <LoginWIthFacebookDialog />,
  },
  {
    id: "login-with-google",
    component: <LoginWithGoogleDialog />,
  },
  {
    id: "omm-email-service",
    component: <MailGunApiSetupDialog />,
  },
  {
    id: "leads-column-edit",
    component: <ContactsColumnsDialog />,
  },
  {
    id: "add-contact",
    component: <AddContactsDialog />,
  },
  {
    id: "admission-payment",
    component: <AdmissionPaymentDialog />,
  },
  {
    id: "manage-course-batch",
    component: <ManageCourseBatchDialog />,
  },
  {
    id: "upload-document-dialog",
    component: <UploadDocumentsDialog />,
  },
  {
    id: "view-student-upload-documents",
    component: <StudentUploadedDocDialog />,
  },

  {
    id: "rename-file-or-folder",
    component: <RenameFileOrFolder />,
  },

  {
    id: "add-folder",
    component: <AddFolder />,
  },

  {
    id: "choose-files-dialog",
    component: <ChooseFilesDialog />,
  },
  {
    id: "inventory-stock-dialog",
    component: <AddInventoryStockDialog />,
  },

  {
    id: "inventory-stock-consume-dialog",
    component: <ConsumeStockDialog />,
  },

  {
    id: "faculty-assign-courses-dialog",
    component: <FacultyAssignCoursesDialog />,
  },
  {
    id: "add-discount-dialog",
    component: <AddDiscountDialog />,
  },

  {
    id: "add-leave-request",
    component: <AddLeaveRequest />,
  },
  {
    id: "designation-dialog",
    component: <DesignationDialog />,
  },
  {
    id: "department-designation-dialog",
    component: <DepartmentAndDesignation />,
  },
  {
    id: "open-multiple-vendor",
    component: <AddMultipleVendor />,
  },
  {
    id: "assign-assets",
    component: <AssignAssetDialog />,
  },
  {
    id: "refund-form-dialog",
    component: <RefundFormDialog />,
  },
  {
    id: "generate-payment-link-dialog",
    component: <GeneratePaymentLinkDialog />,
  },

  {
    id: "add-inventory-stock",
    component: <AddInventoryItemStock />,
  },

  {
    id: "Induction Training",
    component: <InductionTrainingForm />,
  },
  {
    id: "Skill Enhancement",
    component: <SkillEnhancementForm />,
  },
  {
    id: "Training Requirement",
    component: <TrainingRequirement />,
  },
  {
    id: "view-requirement-details",
    component: <ViewRequirementDetailsDialog />,
  },

  {
    id: "view-pms-history",
    component: <ViewPmsHistoryDialog />,
  },

  {
    id: "issue-book-to-student",
    component: <IssueBookToStudent />,
  },

  {
    id: "assign-permission",
    component: <AssignPermissionDialog />,
  },
];

export default function DialogWrapper(props: DivType) {
  const { type, dialogId } = useSelector((state: RootState) => state.dialogs);
  const DialogToRender = dialogs.find((item) => item.id === dialogId)
    ?.component || <></>;
  return (
    <div
      {...props}
      className={`fixed size-full bg-[#00000062] inset-0 z-50 ${
        props.className
      } ${type === "OPEN" ? "block" : "hidden"}`}
    >
      {DialogToRender}
    </div>
  );
}
