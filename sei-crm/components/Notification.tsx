import { useEffect, useRef, useState } from "react";
import { MdNotifications, MdOutlineNotificationsActive } from "react-icons/md";

export default function Notification() {
  const [isNotificationVisiable, setIsNotificationVisiable] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <div ref={modalRef} className="relative cursor-pointer">
        <MdNotifications
          onClick={() => setIsNotificationVisiable(!isNotificationVisiable)}
          size={22}
        />
        {/* <div className="absolute size-4 flex-center bg-red-600 -top-2 -right-2 rounded-full text-[10px] font-semibold text-white">
          2
        </div> */}

        <div
          className={`fixed w-96 h-96 bg-white z-30 notification-shdow right-32 top-[4.5rem] ${
            isNotificationVisiable ? "flex" : "hidden"
          } flex-col`}
        >
          <h2 className="font-semibold p-4 text-sm border-b">Notifications</h2>

          <ul className="flex-grow overflow-y-auto">
            {[1, 2, 3].map((item) => (
              <li key={item} className="p-4 space-y-3 border-b">
                <div className="w-full flex items-center gap-3">
                  <div className="min-h-10 min-w-10 bg-gray-200 rounded-full flex-center">
                    <MdOutlineNotificationsActive />
                  </div>
                  <div>
                    <h2 className="text-sm leading-none">
                      From{" "}
                      <span className="font-semibold">
                        Inventory Management
                      </span>
                    </h2>
                    <span className="text-xs text-gray-500 leading-none">
                      19 Dec, 2024
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-[18px]">
                  Mobile phone has out of stock. the Minimum quantity is 150 now
                  we have only 50 in stock. please fullfill the stock we need
                  this stock tomorrow. please do it fast.
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
