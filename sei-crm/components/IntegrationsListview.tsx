"use client";

import { setDialog } from "@/redux/slices/dialogs.slice";
import Button from "./Button";
import Image from "next/image";
import { useDispatch } from "react-redux";
import React from "react";
import { ServicesType } from "@/types";

interface IProps {
  services: ServicesType[];
}

export default function IntegrationsListview({ services }: IProps) {
  const dispatch = useDispatch();
  const handleConfigureBtnClick = (id: string) => {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: id,
      })
    );
  };

  return (
    <>
      <ul className="w-full grid grid-cols-3 mt-3 gap-7">
        {services.map((service) => (
          <li
            key={service.id}
            className="border shadow-md rounded-lg p-4 space-y-4"
          >
            <div className="flex items-start gap-x-3">
              <div className="size-14">
                <div className="border-2 rounded-lg size-14 p-[6px]">
                  <Image
                    src={service.icon}
                    alt="Mailgun Icon"
                    height={512}
                    width={512}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold tracking-wider">{service.name}</h4>
                <h5 className="text-xs text-gray-500 tracking-wider">
                  {service.description}
                </h5>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Button
                onClick={() => handleConfigureBtnClick(service.id)}
                className="!text-xs"
              >
                Configure
              </Button>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
