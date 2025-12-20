import io from "socket.io-client";

const URL_SOCKET = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "/";

const socket = io(URL_SOCKET, {
    autoConnect: false,
});

export default socket;