import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Per semplicità in dev, in prod andrebbe ristretto (ricordi della tesi)
    methods: ["GET", "POST"]
  }
});

//app.use(express.static(path.join(__dirname, "client/build")));  //gemini dice di usarlo, ancora non so comes

io.on("connection", (socket) => {
  console.log("Nuova connessione stabilita");

  // Quando l'host (PC) chiede di creare una stanza, in fase di collegamento host-controller
  socket.on("createRoom", () => {
    const roomID = Math.random().toString(36).substring(2, 6).toUpperCase();
    socket.join(roomID);
    socket.emit("roomCreated", roomID); // Manda l'Id al PC così che lo può mostrare/incapsulare in un qr
    console.log("Stanza creata: " + roomID);
  });

  // Quando il controller (smartphone) ha visualizzato il qr e vuole entrare nella stanza, in fase di collegamento host-controller
  socket.on("joinRoom", (roomID) => {
    const room = io.sockets.adapter.rooms.get(roomID);

    if(room && room.size>0) {
      socket.join(roomID);
      socket.to(roomID).emit("controllerConnected");  // Avvisa l'host che il controller è connesso
    }
  });

  // In fase di negoziazione, il server inoltra i messaggi all'altro peer
  socket.on("negotiation", (data) => {
    // data = {roomID, type, payload}
    socket.to(roomID).emit("negotiation", data);
    console.log("Inoltrato {", data, "}");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnesso");
    // Logica per avvisare che l'host se il controller cade?????
  });
});

// Fallback del react router: qualsiasi cosa ottiene index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});


const port = process.env.PORT || 3000;  // Default
httpServer.listen(port, () => {
  console.log("http://localhost:"+ port);
});