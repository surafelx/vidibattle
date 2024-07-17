import { useEffect, useState } from "react";
import "./App.css";
import Router from "./Routes";
import socket, { initializeSocket } from "./services/socket";
import { getUser, getUserId } from "./services/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from "./services/crud";

function App() {
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const getMessages = (cid: string) => {
    get("chat/all-messages/" + cid)
      .then((res) => {
        const count = res.data.messages.filter(({ seen }: any) => !seen).length;
        setMessageCount(count);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getNotifications = (cid: string) => {
    get("notification/unseen", { query: { _id: cid } })
      .then((res) => {
        setNotificationCount(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    const user = getUser();
    const userId = getUserId();

    console.log(userId);

    if (user !== null && userId !== null) {
      // Create socket connection for logged in users
      if (!socket.connected) {
        initializeSocket();
      }
      getMessages(user.username);
      getNotifications(userId);

      socket.on("INCOMING_MESSAGE", function (res) {
        if (res.receiver == userId) {
          if (!res.message.seen) {
            getMessages(user.username);
            setMessageCount(messageCount + 1);
          }
        }
      });

      socket.on("INCOMING_NOTIFICATION", function (res) {
        if (res.to == userId) {
          setNotificationCount(notificationCount + 1);
        }
      });
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <>
      <Router
        messageCount={notificationCount}
        notificationCount={notificationCount}
      />
      <ToastContainer />
    </>
  );
}

export default App;
