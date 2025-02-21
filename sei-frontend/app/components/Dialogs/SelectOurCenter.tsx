"use client";

import Link from "next/link";
import DialogBody from "./DialogBody";
import Button from "../Button";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import { useTransition } from 'react';
import { setInfo } from "@/app/utils/saveInfo";

export default function SelectOurCenter() {
  const dispatch = useDispatch();
  const [isSavingKolkata, setKolkata] = useTransition();
  const [isSavingFaridabad, setFaridabad] = useTransition();
  
  return (
    <DialogBody preventToClose = {true}>
      <div className="space-y-5 *:block">
        <span className="text-xl font-semibold">
          Please select your institute
        </span>
        <Link href={"/our-courses/kolkata"}>
          <Button
            disable = {isSavingKolkata}
            loading = {isSavingKolkata}
            onClick={() => {
              setKolkata(async () => {
                await setInfo("user-selected-institute", "Kolkata");
                dispatch(setDialog({ type: "CLOSE", dialogKey: "" }));
                localStorage.setItem("user-selected-institute", "Kolkata");
              })
            }}
            className="!bg-[#E9B858] !text-black !border-black !w-full hover:!bg-white"
          >
            Kolkata
          </Button>
        </Link>
        <Link href={"/our-courses/faridabad"}>
          <Button
            disable = {isSavingFaridabad}
            loading = {isSavingFaridabad}
            onClick={() => {
              setFaridabad(async () => {
                await setInfo("user-selected-institute", "Faridabad");
                dispatch(setDialog({ type: "CLOSE", dialogKey: "" }));
                localStorage.setItem("user-selected-institute", "Faridabad");
              })
            }}
            className="!bg-[#E9B858] !text-black !border-black !w-full hover:!bg-white"
          >
            Faridabad
          </Button>
        </Link>
      </div>
    </DialogBody>
  );
}
