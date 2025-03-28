import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { FaCaretDown } from "react-icons/fa6";
import { ISuccess, TSideBar, TSingleMember } from "@/types";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import HandleSuspence from "../HandleSuspence";
import { sidebarOptions } from "../Security/ProtectedRouteProvider";

interface IDropMenu {
  options: TSideBar[];
  checkedItems: { [key: string]: boolean };
  toggleCheck: (id: string, isChecked: boolean) => void;
}

const final_sidebar = [
  {
    icon: null,
    id: "camp",
    name: "Campus",
    slug: "",
    subMenu: [
      { id: "camp-1", icon: "", name: "Kolkata", slug: "" },
      { id: "camp-2", icon: "", name: "Faridabad", slug: "" },
    ],
  },
  ...sidebarOptions,
];

interface IEachListItem {
  option: TSideBar;
  checkedItems: { [key: string]: boolean };
  toggleCheck: (id: string, isChecked: boolean) => void;
}

const getSingleMemberInfo = async (member_id?: number) => {
  if (!member_id) return null;
  return (await axios.get(`${BASE_API}/setting/member/${member_id}`)).data;
};

const EachListItem = ({ option, checkedItems, toggleCheck }: IEachListItem) => {
  const [isExpand, setIsExpand] = useState(false);

  const isChecked = checkedItems[option.id] || false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    toggleCheck(option.id, checked);
  };

  return (
    <li onClick={() => setIsExpand(!isExpand)} className={"text-gray-700"}>
      <div className="flex cursor-pointer items-center justify-between">
        <div onClick={(e) => e.stopPropagation()}>
          <input
            onChange={handleChange}
            type="checkbox"
            className="float-left inline-block mt-1 mr-2 cursor-pointer"
            checked={isChecked}
          />
          <span className={`${option.subMenu ? "font-[600]" : ""}`}>
            {option.name}
          </span>
        </div>
        {option.subMenu ? (
          <FaCaretDown className={`${isExpand ? "rotate-180" : "rotate-0"}`} />
        ) : null}
      </div>

      {option.subMenu ? (
        <div
          className={`ml-4 overflow-hidden ${
            isExpand ? "max-h-[500px]" : "max-h-0"
          } transition-all duration-300 ease-linear !text-sm`}
        >
          <DropMenu
            options={option.subMenu}
            checkedItems={checkedItems}
            toggleCheck={toggleCheck}
          />
        </div>
      ) : null}
    </li>
  );
};

const DropMenu = ({ options, checkedItems, toggleCheck }: IDropMenu) => {
  return (
    <ul className="space-y-2 pt-1">
      {options.map((option) => (
        <EachListItem
          key={option.id}
          option={option}
          checkedItems={checkedItems}
          toggleCheck={toggleCheck}
        />
      ))}
    </ul>
  );
};

export default function AssignPermissionDialog() {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const toggleCheck = (id: string, isChecked: boolean) => {
    setCheckedItems((prev) => {
      const updatedCheckedItems = { ...prev, [id]: isChecked };

      // If it's a parent, update all its children
      const parent = final_sidebar.find((item) => item.id === id);
      if (parent && parent.subMenu) {
        parent.subMenu.forEach((child) => {
          updatedCheckedItems[child.id] = isChecked;
        });
      }

      return updatedCheckedItems;
    });
  };

  const { isLoading: isSavingPermission, mutate: savePermissions } =
    useDoMutation();

  const { error, isFetching } = useQuery<ISuccess<TSingleMember>>({
    queryKey: ["get-single-member-info"],
    queryFn: () => getSingleMemberInfo(extraValue?.member_id),
    refetchOnMount: true,
    onSuccess(data) {
      const parsedPermissions = JSON.parse(data.data.permissions);
      setCheckedItems(parsedPermissions);
    },
  });

  const handleSavePermissionBtn = () => {
    const permission: { [key: string]: boolean } = {};
    Object.entries(checkedItems).forEach((item) => {
      if (item[1] === true) {
        permission[item[0]] = true;
      }
    });
    savePermissions({
      apiPath: "/setting/member",
      method: "patch",
      formData: {
        permissions: JSON.stringify(permission),
      },
      id: extraValue?.member_id,
    });
  };

  return (
    <DialogBody className="min-w-[32rem] max-h-[90vh] overflow-y-scroll">
      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <div className="pt-5">
          <DropMenu
            options={final_sidebar}
            checkedItems={checkedItems}
            toggleCheck={toggleCheck}
          />
        </div>

        <Button
          disabled={isSavingPermission}
          loading={isSavingPermission}
          onClick={handleSavePermissionBtn}
        >
          Save Permission
        </Button>
      </HandleSuspence>
    </DialogBody>
  );
}
