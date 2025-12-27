import socket from "../services/socket";
import webrtc from "../services/webRTC";
import QRCodeDisplay from "../components/QRCodeDisplay";
import PageLayout from "../components/PageLayout";
import React, { useEffect, useState, useRef } from "react";

const Host = () => {
    const [roomID, setRoomID] = useState(null);
    const [status, setStatus] = useState("Disconnesso");
    const [socketID, setSocketID] = useState("");

    // Per mantenere il valore di roomID nelle callback async
    const roomIDRef = useRef(null);
    const audioRef = useRef(null);

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

            webrtc.initOfferer((candidate) => {
                socket.emit("negotiation", { 
                    roomID: roomIDRef.current, 
                    type: "candidate", 
                    payload: candidate 
                });
            }, (stream) => {
                
                const audioTracks = stream.getAudioTracks();
                if (audioRef.current) {
                    audioRef.current.srcObject = stream;
                    audioRef.current.muted = false;
                    audioRef.current.volume = 1.0;
                    audioRef.current.autoplay = true;
                    const playPromise = audioRef.current.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(e => console.error("Errore autoplay:", e));
                    }
                }
            }, (label, data) => console.log(`Dati ricevuti su ${label}:`, data)
            );

            // Inizia la negoziazione
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

    // Stanza non ancora creata
    if (!roomID) {
        return (
            <PageLayout>
                <audio ref={audioRef} autoPlay style={{ display: 'none' }} /> {/* audio tag replicata per popolare audioRef prima dell'evento */}
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
                <p className="loading-text">Generazione stanza in corso...</p>
            </PageLayout>
        );
    }

    // Stanza creata ma controller non connesso
    if (!status.includes("Controller Connesso!")) {
        return (
            <PageLayout>
                <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
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
                <div className="qr-container">
                    <h3 className="qr-title">Scansiona per connetterti</h3>
                    
                    <div className="qr-background">
                        <QRCodeDisplay roomId={roomID} />
                    </div>
            
                    <div className="session-id-display">
                        {roomID}
                    </div>
                </div>
            </PageLayout>
        );
    }

    // Controller connesso
    return (
        <PageLayout>
            <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
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
            {/* TODO: Implementare interfaccia controller connesso */}
        </PageLayout>
    );
};

export default Host;