"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { BASE_API } from "../constant";
import axios, { AxiosError } from "axios";
import { IResponse, TLoginSuccess } from "../type";
import SpinnerSvg from "./SpinnerSvg";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setProfileImage } from "../redux/slice/profileImage.slice";
import { setInfo } from "../utils/saveInfo";

interface IProps {
  imageUrl: string | null;
  student_id: number;
}

export default function StudentProfileImage({ student_id, imageUrl }: IProps) {
  const [image, setImage] = useState<string | null>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("profile_image", file);
    formData.append("student_id", `${student_id}`);
    try {
      const { data } = await axios.request<IResponse<string>>({
        method: "post",
        url: BASE_API + "/student/profile-image",
        data: formData,
      });
      dispatch(setProfileImage({ image: data.data }));
      const loginInfo = JSON.parse(localStorage.getItem("login-info") || "{}") as TLoginSuccess;
      loginInfo.profile_image = data.data;
      await setInfo("login-info", JSON.stringify(loginInfo));
      toast.success(data.message);
      // localStorage.setItem("profile-image", data.data as string);
    } catch (error) {
      const err = error as AxiosError<IResponse>;
      toast.error(err.response?.data.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!confirm("Are you want to update your image ?")) {
      return;
    }

    const pickedFile = event.target.files![0];
    uploadFile(pickedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(pickedFile);
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
            src={image ?? BASE_API + "/" + imageUrl}
            alt="Student Profile Image"
            height={1200}
            width={1200}
          />
        ) : (
          <MdOutlineAddPhotoAlternate size={28} className="text-gray-500" />
        )}

        <div
          className={`size-full inset-0 absolute bg-[#0000009f] ${
            isUploading ? "flex" : "hidden"
          } items-center justify-center flex-col`}
        >
          <SpinnerSvg size="30px" className="text-white" />
          <span className="text-white">Uploading...</span>
        </div>
      </div>
    </div>
  );
}
