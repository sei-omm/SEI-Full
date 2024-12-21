"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { BASE_API } from "../constant";
import { IResponse, TLoginSuccess } from "../type";
import SpinnerSvg from "./SpinnerSvg";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setProfileImage } from "../redux/slice/profileImage.slice";
import { setInfo } from "../utils/saveInfo";
import { uploadToVercel } from "../utils/uploadToVercel";
import { PutBlobResult } from "@vercel/blob";
import { axiosQuery } from "../utils/axiosQuery";
import { getAuthToken } from "../utils/getAuthToken";

interface IProps {
  imageUrl: string | null;
}

export default function StudentProfileImage({ imageUrl }: IProps) {
  const [image, setImage] = useState<string | null>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const [uploadingStatus, setUploadingStatus] = useState<"done" | "uploading">(
    "done"
  );

  const saveProfileImage = async (blob: PutBlobResult) => {
    const { error, response } = await axiosQuery<
      IResponse<string>,
      IResponse<string>
    >({
      url: BASE_API + "/student/profile-image",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      data: {
        profile_url: blob.url,
      },
    });

    if (error) return toast.error(error.message);

    dispatch(setProfileImage({ image: response?.data as string }));
    const loginInfo = JSON.parse(
      localStorage.getItem("login-info") || "{}"
    ) as TLoginSuccess;
    loginInfo.profile_image = response?.data as string;
    await setInfo("login-info", JSON.stringify(loginInfo));
    toast.success(response?.message);
  };

  const onFilePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!confirm("Are you want to update your image ?")) {
      return;
    }

    const pickedFile = event.target.files![0];
    if (!pickedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(pickedFile);

    uploadToVercel({
      fileName: `students-profile/${pickedFile.name}`,
      file: pickedFile,
      endPoint: "/upload/student-profile",
      convartToWebp: true,
      onProcessing() {
        setUploadingStatus("uploading");
      },
      onError(error) {
        toast.error(error.message);
      },
      onUploaded(blob) {
        setUploadingStatus("done");
        saveProfileImage(blob);
      },
    });
  };

  const handleImageClick = () => {
    if (!filePickerRef.current) return toast.error("File Picker Ref Is Empty");

    filePickerRef.current.click();
  };

  return (
    <div>
      <div
        onClick={handleImageClick}
        className="size-40 sm:size-20 bg-gray-300 shadow-xl cursor-pointer relative flex-center rounded-lg overflow-hidden"
      >
        <input
          ref={filePickerRef}
          onChange={onFilePicked}
          accept="image/*"
          hidden
          type="file"
        />

        {imageUrl ? (
          <Image
            className="size-full object-cover"
            src={image ?? imageUrl}
            alt="Student Profile Image"
            height={1200}
            width={1200}
          />
        ) : (
          <MdOutlineAddPhotoAlternate size={28} className="text-gray-500" />
        )}

        <div
          className={`size-full inset-0 absolute bg-[#0000009f] ${
            uploadingStatus === "uploading" ? "flex" : "hidden"
          } items-center justify-center flex-col`}
        >
          <SpinnerSvg size="30px" className="text-white" />
          <span className="text-white">Uploading...</span>
        </div>
      </div>
    </div>
  );
}
