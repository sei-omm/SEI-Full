import { BASE_API } from "@/app/constant";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { ISuccess } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdNotifications, MdOutlineNotificationsActive } from "react-icons/md";
import { useQuery } from "react-query";
import HandleSuspence from "./HandleSuspence";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Spinner from "./Spinner";
import { queryClient } from "@/redux/MyProvider";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

type Notification = {
  notification_id: number;
  notification_title: string;
  notification_description: string;
  link: string | null;
  created_at: string; // Use `Date` if you plan to convert it later
  is_readed: boolean;
  notification_sended_id: number;
};

export default function Notification() {
  const [isNotificationVisiable, setIsNotificationVisiable] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const checkClickOutside = (event: MouseEvent) => {
    if (
      isNotificationVisiable &&
      !modalRef.current?.contains(event.target as Node)
    ) {
      setIsNotificationVisiable(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [isNotificationVisiable]);

  const {
    data: notifications,
    error,
    isFetching,
  } = useQuery<ISuccess<Notification[]>>({
    queryKey: ["my-notification", currentPage],
    queryFn: async () =>
      (
        await axios.get(`${BASE_API}/notification?page=${currentPage}`)
      ).data,
  });

  const { isLoading, mutate } = useDoMutation();

  const handleReadNotification = (notificationRowId: number) => {
    mutate({
      apiPath: "/notification/read",
      method: "delete",
      id: notificationRowId,
      headers: {
        ...getAuthToken(),
      },
      onSuccess() {
        queryClient.invalidateQueries(["my-notification"]);
      },
    });
  };

  return (
    <>
      <div ref={modalRef} className="relative cursor-pointer">
        <MdNotifications
          onClick={() => setIsNotificationVisiable(!isNotificationVisiable)}
          size={22}
        />
        {notifications?.data.length === 0 && currentPage === 1 ? null : (
          <div className="absolute size-[10px] flex-center bg-red-600 -top-[0.25rem] -right-[0.18rem] rounded-full text-[10px] font-semibold text-white"></div>
        )}

        <div
          className={`fixed w-96 h-96 bg-white z-30 notification-shdow right-32 top-[4.5rem] ${
            isNotificationVisiable ? "flex" : "hidden"
          } flex-col`}
        >
          <h2 className="font-semibold p-4 text-sm border-b">Notifications</h2>

          <div className="mt-3"></div>

          <HandleSuspence
            isLoading={isFetching}
            error={error}
            dataLength={notifications?.data.length}
            noDataMsg="No Notification Found"
          >
            <ul className="flex-grow overflow-y-auto">
              {notifications?.data.map((notification) => (
                <li
                  key={notification.notification_id}
                  className="p-4 space-y-3 border-b"
                >
                  <div className="w-full flex items-center gap-3">
                    <div className="min-h-10 min-w-10 bg-gray-200 rounded-full flex-center">
                      <MdOutlineNotificationsActive />
                    </div>
                    <div>
                      <h2 className="text-sm leading-none">
                        {notification.notification_title}
                      </h2>
                      <span className="text-xs text-gray-500 leading-none">
                        {beautifyDate(notification.created_at, true)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 leading-[18px]">
                      {notification.notification_description}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {isLoading ? (
                        <Spinner size="12px" />
                      ) : (
                        <div
                          onClick={() => {
                            handleReadNotification(
                              notification.notification_sended_id
                            );
                          }}
                          className="text-xs underline text-yellow-600"
                        >
                          Read
                        </div>
                      )}

                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="text-xs underline text-blue-700"
                        >
                          View Link
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </HandleSuspence>
          <div className="flex text-center gap-2 p-3">
            <GrFormPrevious
              onClick={() => {
                if (currentPage === 1) return;
                setCurrentPage(currentPage - 1);
              }}
              className={`${currentPage === 1 ? "opacity-50" : "opacity-100"}`}
            />
            <GrFormNext
              onClick={() => {
                if (notifications?.data.length === 0) return;
                setCurrentPage(currentPage + 1);
              }}
              className={`${
                notifications?.data.length === 0 ? "opacity-50" : "opacity-100"
              }`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
