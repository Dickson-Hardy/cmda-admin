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

let sharedSocket = null;
let sharedSocketUsers = 0;

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
    const newSocket = sharedSocket || io(URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });
    if (!sharedSocket) sharedSocket = newSocket;
    sharedSocketUsers += 1;
    let refreshing = false;

    const onConnect = () => {
      setState({ connected: true });
    };

    const onDisconnect = () => {
      setState({ connected: false });
    };

    const onConnectError = (error) => {
      console.log("SOCKET_ERROR", error);
    };

    const onAuthError = async () => {
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
    };
    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);
    newSocket.on("auth_error", onAuthError);

    setSocket(newSocket);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.off("auth_error", onAuthError);
      sharedSocketUsers = Math.max(0, sharedSocketUsers - 1);
      if (sharedSocketUsers === 0) {
        newSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, [accessToken, refreshToken, dispatch]);

  return { socket, state };
};
