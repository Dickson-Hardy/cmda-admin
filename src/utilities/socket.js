import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setTokens, clearTokens } from "~/redux/features/auth/tokenSlice";
import { logout } from "~/redux/features/auth/authSlice";
import { refreshSession } from "~/utilities/refreshSession";

const socketState = {
  connected: false,
};

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [state, setState] = useState(socketState);
  const accessToken = useSelector((store) => store.token?.accessToken);
  const refreshToken = useSelector((store) => store.token?.refreshToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      setState({ connected: false });
      return;
    }

    const URL = import.meta.env.VITE_API_BASE_URL || "https://cmdabackend-38258a63fa98.herokuapp.com";
    const newSocket = io(URL, { auth: { token: accessToken } });
    let refreshing = false;

    newSocket.on("connect", () => {
      setState({ connected: true });
    });

    newSocket.on("disconnect", () => {
      setState({ connected: false });
    });

    newSocket.on("connect_error", (error) => {
      console.log("SOCKET_ERROR", error);
    });

    newSocket.on("auth_error", async () => {
      if (refreshing || !refreshToken) return;
      refreshing = true;
      try {
        const refreshedTokens = await refreshSession(URL, refreshToken);
        if (!refreshedTokens) throw new Error("Session refresh failed");
        dispatch(setTokens(refreshedTokens));
        newSocket.auth = { token: refreshedTokens.accessToken };
        newSocket.connect();
      } catch {
        dispatch(clearTokens());
        dispatch(logout());
      } finally {
        refreshing = false;
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken, refreshToken, dispatch]);

  return { socket, state };
};
