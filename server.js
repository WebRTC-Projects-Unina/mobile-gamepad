import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Per semplicità in dev, in prod andrebbe ristretto (ricordi della tesi)
        methods: ["GET", "POST"]
    }
});

// Mappatura per sapere chi era in quale stanza e con quale ruolo
// Servono per gestire le disconnessioni di uno dei due peer e avvisare l'altro
const socketRoom = new Map();
const socketRole = new Map();

app.use(express.static(path.join(__dirname, "client/build")));

io.on("connection", (socket) => {
    console.log("Nuova connessione stabilita");

    // Quando l'host (PC) chiede di creare una stanza, in fase di collegamento host-controller
    socket.on("createRoom", () => {
        const roomID = Math.random().toString(36).substring(2, 6).toUpperCase();
        socket.join(roomID);
        socket.emit("roomCreated", roomID); // Manda l'Id al PC così che lo può mostrare/incapsulare in un qr
        socketRoom.set(socket.id, roomID);
        socketRole.set(socket.id, "host");
        console.log("Stanza creata: " + roomID);
    });

    // Quando il controller (smartphone) ha visualizzato il qr e vuole entrare nella stanza, in fase di collegamento host-controller
    socket.on("joinRoom", (roomID) => {
        const room = io.sockets.adapter.rooms.get(roomID);

        if (room && room.size > 0) {
            socket.join(roomID);
            socketRoom.set(socket.id, roomID);
            socketRole.set(socket.id, "controller");
            socket.to(roomID).emit("controllerConnected");  // Avvisa l'host che il controller è connesso
        }
    });

    // In fase di negoziazione, il server inoltra i messaggi all'altro peer
    socket.on("negotiation", (data) => {
        // data = {roomID, type, payload}
        socket.to(data.roomID).emit("negotiation", data);
        console.log("Inoltrato ", data.type, " in ", data.roomID);
    });

    // Avvisa l'host se il controller cade
    socket.on("controllerDisconnected", (roomID) => {
        socket.to(roomID).emit("controllerDisconnected");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnesso");
        const roomID = socketRoom.get(socket.id);
        const role = socketRole.get(socket.id);

        if (roomID && role) {
            if (role === "host") {
                socket.to(roomID).emit("hostDisconnected", { roomID });
                // Elimina sia controller che host (pulisci la stanza, l'host ne dovrà creare una nuova)
                for (const [sid, rid] of socketRoom.entries()) {
                    if (rid === roomID) {
                        socketRoom.delete(sid);
                        socketRole.delete(sid);
                    }
                }
            } else {
                socket.to(roomID).emit("controllerDisconnected", { roomID });
                socketRoom.delete(socket.id); // manteniamo l'host per riuso della stessa stanza
                socketRole.delete(socket.id);
            }
        }
    });
});

// Fallback del react router: qualsiasi cosa ottiene index
app.get(/.*/, (_, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
    //res.send("Hi")
});

const port = process.env.PORT || 3000;  // Default
httpServer.listen(port, () => {
    console.log("http://localhost:" + port);
});