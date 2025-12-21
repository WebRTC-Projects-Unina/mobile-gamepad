import socket from "../services/socket";
import webrtc from "../services/webrtc";
import QRCodeDisplay from "../components/QRCodeDisplay";
import PageLayout from "../components/PageLayout";
import React, { useEffect, useState, useRef } from "react";

const Host = () => {
    const [roomID, setRoomID] = useState(null);
    const [status, setStatus] = useState("Disconnesso");
    const [socketID, setSocketID] = useState("");

    // Per mantenere il valore di roomID nelle callback async
    const roomIDRef = useRef(null);

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
            roomIDRef.current = id;
            console.log("Stanza creata con ID:", id);
        });

        socket.on("controllerConnected", async () => {
            setStatus("Controller Connesso! Pronto a giocare.");
            // CALLBACK PER AUDIO E GESTIONE DEI MESSAGGI ANCORA NON IMPLEMENTATE
            webrtc.initPeerConnection((candidate) => {
                socket.emit("negotiation", { 
                    roomID: roomIDRef.current, 
                    type: "candidate", 
                    payload: candidate 
                });
            });

            webrtc.createDataChannels((label, data) => {
                console.log(`Dati ricevuti su ${label}:`, data);
            });

            const offer = await webrtc.createOffer();
            socket.emit("negotiation", { 
                roomID: roomIDRef.current, 
                type: "offer", 
                payload: offer 
            });
        });

        socket.on("negotiation", async (data) => {
            if (data.type === "answer") {
                console.log("Risposta ricevuta, connessione P2P in finalizzazione...");
                await webrtc.setRemoteAnswer(data.payload);
            } 
            else if (data.type === "candidate") {
                await webrtc.addIceCandidate(data.payload);
            }
        });

        socket.on("controllerDisconnected", () => {
            setStatus("Controller perso!");
            webrtc.close();

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
            socket.off("controllerDisconnected");
            socket.off("negotiation");
            socket.off("connect_error");
            socket.disconnect();
            webrtc.close();
        };
    }, []);

    const statusColor = status.includes("Connesso") ? '#4caf50' : '#ff6b6b';

    return (
        <PageLayout>
            <h1 className="page-title">Modulo HOST (PC)</h1>
            
            <div className="status-card">
                <div className="status-text">
                    <strong>Stato Socket:</strong> 
                    <span className="status-indicator" style={{ color: statusColor }}>
                        {status}
                    </span>
                </div>
                {socketID && <small className="socket-id">Socket ID: {socketID}</small>}
            </div>

            {!roomID && (
                <p className="loading-text">Generazione stanza in corso...</p>
            )}
            
            {roomID && !status.includes("Controller Connesso!") && (
                <div className="qr-container">
                    <h3 className="qr-title">Scansiona per connetterti</h3>
                    
                    <div className="qr-background">
                        <QRCodeDisplay roomId={roomID} />
                    </div>
            
                    <div className="session-id-display">
                        {roomID}
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Host;