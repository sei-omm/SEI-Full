import React from "react";

interface IProps {
  className ? : string;
  color ? : string;
}

export default function OurMission({ className, color }: IProps) {
  return (
    <>
      <svg
        className={className}
        fill={color || "#000000"}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <title></title>{" "}
          <g id="mission">
            {" "}
            <path d="M21.85,21.15l-7-7a.48.48,0,0,0-.7,0L12.5,15.79,8,11.29V9h3v1a.5.5,0,0,0,.5.5h6a.52.52,0,0,0,.45-.27.51.51,0,0,0-.05-.52L16.12,7.25,17.9,4.79A.51.51,0,0,0,18,4.27.52.52,0,0,0,17.5,4H14V2.5a.5.5,0,0,0-.5-.5h-6a.5.5,0,0,0-.5.5v8.79L2.44,15.85A1.52,1.52,0,0,0,2,16.91V20.5A1.5,1.5,0,0,0,3.5,22h18a.5.5,0,0,0,.46-.31A.47.47,0,0,0,21.85,21.15ZM16.52,5,15.1,7a.48.48,0,0,0,0,.58l1.42,2H12V9h1.5a.5.5,0,0,0,.5-.5V5ZM13,8H8V3h5ZM3.5,21a.5.5,0,0,1-.5-.5V16.91a.47.47,0,0,1,.15-.35L7.5,12.21l4.65,4.64L16.29,21Zm14.21,0-4.5-4.5,1.29-1.29L20.29,21Z"></path>{" "}
          </g>{" "}
        </g>
      </svg>
    </>
  );
}
