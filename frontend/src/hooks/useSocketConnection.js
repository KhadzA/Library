import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket, { connectSocket } from "../socket";

export const useSocketConnection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    connectSocket(); // connects using the stored token

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message === "Invalid token") {
        localStorage.removeItem("token");
        navigate("/auth/login?session_expired=true");
      }
    });

    socket.on("tokenExpired", () => {
      console.log("JWT has expired (from server emit), logging out...");
      localStorage.removeItem("token");
      navigate("/auth/login?session_expired=true");
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("tokenExpired");
    };
  }, [navigate]);
};
