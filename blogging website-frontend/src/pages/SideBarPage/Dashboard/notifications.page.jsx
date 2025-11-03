import axios from "axios";
import { useContext, useEffect, useState } from "react";

import { UserContext } from "@/App";

import Button from "@/components/button";
import filterPaginationData from "@/common/filter-pagination-data";

import Loader from "@/components/loader.component";
import AnimationWrapper from "@/common/page-animation";

import NotificationCard from "@/components/notification/notification-card.component";
import NoDataMessage from "@/components/nodata.component";
import LoadMoreDataBtn from "@/components/load-more.component";
import { useTheme } from "@/hooks/useTheme";

const Notifications = () => {
  const FILTERS = [
    { label: "all", value: "all" },
    { label: "likes", value: "like" },
    { label: "comments", value: "comment" },
    { label: "replies", value: "reply" },
    { label: "follows", value: "follows" },
    { label: "mentions", value: "mentions" },
  ];

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  const {
    userAuth,
    userAuth: { access_token, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);

  const { theme, setTheme } = useTheme();

  //====================================================================================================

  const fetchNotifications = async ({ page, deleteDocCount = 0 }) => {
    try {
      const {
        data: { notifications: dataNotifications },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
        {
          page,
          filter,
          deleteDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (new_notification_available) {
        setUserAuth((prev) => ({
          ...prev,
          new_notification_available: false,
        }));
      }

      const formattedData = await filterPaginationData({
        state: notifications,
        data: dataNotifications,
        page,
        countRoute: "/all-notifications-count",
        data_to_send: { filter },
        userAccessToken: access_token,
      });

      setNotifications(formattedData);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  useEffect(() => {
    if (notifications) {
      console.log("🔔 notifications state updated:", notifications);
    }
  }, [notifications]);

  //=======================================================================================================

  const handleFilter = (value) => {
    setFilter(value);
    setNotifications(null);
  };

  //=======================================================================================================

  /*
    Tóm lại:
    Dùng () => handleFilter(value) khi cần truyền tham số.
    Dùng handleFilter trực tiếp khi không truyền tham số (handler nhận event).
    Dùng handleFilter(value) chỉ khi hàm handleFilter được thiết kế trả về một function khác.
  */

  return (
    <div>
      <h1 className="max-md:hidden md:mt-8">Recent Notifications</h1>

      <div className="my-8 flex gap-6">
        {FILTERS.map(({ label, value }) => (
          <Button
            key={value}
            onClick={() => handleFilter(value)}
            className={
              "text-sm py-2 " +
              (filter === value ? " btn-dark" : " btn-light") +
              (theme === "dark" ? " hover:bg-slate-600" : " ")
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 
        data = notification đơn lẻ (thông tin dùng để render 1 card).
        notificationState = state quản lý danh sách notifications + hàm cập nhật (để con có thể thay đổi toàn cục).
      */}

      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results?.length ? (
            notifications.results.map((notification, i) => {
              return (
                <AnimationWrapper key={notification._id ?? i} transition={{ delay: i * 0.1 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message="No notifications" />
          )}

          <LoadMoreDataBtn
            state={notifications}
            fetchDataFunc={fetchNotifications}
            additionalParam={{ deleteDocCount: notifications.deleteDocCount }}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
