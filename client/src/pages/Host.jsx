import socket from "../services/socket";
import QRCodeDisplay from "../components/QRCodeDisplay";
import React, { useEffect, useState } from "react";

const Host = () => {
    const [roomID, setRoomID] = useState(null);
    const [status, setStatus] = useState("Disconnesso");
    const [socketID, setSocketID] = useState("");

    useEffect( () => {
        // Connessione e creazione della stanza
        socket.connect();
        setStatus("In attesa di connessione...");
        socket.on("connect", () => {
            setStatus("Connesso al Server");
            setSocketID(socket.id);
            socket.emit("createRoom");
        });

        // Listener per la risposta alla creazione
        socket.on("roomCreated", (id) => {
            setRoomID(id);
            console.log("Stanza creata con ID:", id);
        });

        socket.on("controllerConnected", () => {
            setStatus("Controller Connesso! Pronto a giocare.");
            // NASCONDI IL QR E MOSTRA IL GIOCO (CHE GIOCO?)
        });

        // Gestione errori
        socket.on("connect_error", (err) => {
            setStatus(`Errore connessione: ${err.message}`);
        });

        // Cleanup: Se chiudi la pagina, disconnetti il socket per evitare doppioni
        return () => {
            socket.off("connect");
            socket.off("roomCreated");
            socket.off("controllerConnected");
            socket.off("connect_error");
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Modulo HOST (PC)</h2>
            
            <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                <strong>Stato Socket:</strong> <span style={{ color: status.includes("Connesso") ? "green" : "red" }}>{status}</span>
                <br />
                <small>Socket ID: {socketID}</small>
            </div>

            {roomID ? (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h3>Scansiona questo qr per connetterti:</h3>
                    <QRCodeDisplay roomId={roomID} />
            
                    <div style={{ marginTop: '20px', fontSize: '24px', letterSpacing: '5px' }}>
                        ID: <strong>{roomID}</strong>
                    </div>
                </div>
            ) : (
                <p>Generazione stanza in corso...</p>
            )}
        </div>
    ); 
};

export default Host;