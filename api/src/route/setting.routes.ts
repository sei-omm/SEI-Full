import { Router } from "express";
import {
  assignNewMember,
  getMembers,
  updateSingleMemberPermissions,
  deleteSingleMember,
  changeMemberRole,
  getSingleMemberInfo,
} from "../controller/setting.controller";

export const settingRoute = Router();

settingRoute
  .post("/member", assignNewMember)
  .patch("/member/role/:employee_id", changeMemberRole)
  .patch("/member/:member_id", updateSingleMemberPermissions)
  .delete("/member/:member_id", deleteSingleMember)
  .get("/member", getMembers)
  .get("/member/:member_id", getSingleMemberInfo);
