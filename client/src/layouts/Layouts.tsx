import { ReactNode, useEffect, useState } from "react";
import HomeHeader from "../components/HomeHeader";
import HomeFooterNav from "../components/HomeFooterNav";
import { get } from "../services/crud";
import socket from "../services/socket";
import { getUser, getUserId } from "../services/auth";

export function MainLayout({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const getMessages = (cid: string) => {
    get("chat/all-messages/" + cid)
      .then((res: any) => {
        const count = res.data.messages.filter(({ seen }: any) => !seen).length;
        setMessageCount(count);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getNotifications = (cid: string) => {
    get("notification/unseen", { query: { _id: cid } })
      .then((res: any) => {
        setNotificationCount(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    const user = getUser();
    const userId = getUserId();

    if (user !== null && userId !== null) {
      getMessages(user.username);
      getNotifications(userId);

      socket.on("INCOMING_MESSAGE", function (res: any) {
        if (res.receiver == userId) {
          if (!res.message.seen) {
            getMessages(user.username);
          }
        }
      });

      socket.on("INCOMING_NOTIFICATION", function () {
        getNotifications(userId);
      });
    }
  }, []);

  return (
    <div className="bg-gradient-2">
      <HomeHeader notificationCount={notificationCount} />
      {children}
      <HomeFooterNav active={active} messageCount={messageCount} />
    </div>
  );
}
