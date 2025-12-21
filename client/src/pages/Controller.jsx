import React, { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import PageLayout from "../components/PageLayout";
import socket from "../services/socket";
import webrtc from "../services/webrtc";

const Controller = () => {
    const [searchParams] = useSearchParams();
    const roomID = searchParams.get('room');
    const [connectionStep, setConnectionStep] = useState("Inizializzazione...");

    useEffect( () => {
        if(!roomID) {
          return;   // Mostra il messaggio di errore ma non fare niente
        }
        socket.connect();
        socket.on("connect", () => {
            socket.emit("joinRoom", roomID);
        });

        socket.on("controllerConnected", () => {
            setConnectionStep("In attesa dell'Host...");
        });

        socket.on("negotiation", async (data) => {
            if (data.type === "offer") {
                setConnectionStep("Negoziazione P2P in corso...");
                
                webrtc.initPeerConnection((candidate) => {
                    socket.emit("negotiation", { 
                        roomID, 
                        type: "candidate", 
                        payload: candidate 
                    });
                });

                const answer = await webrtc.createAnswer(data.payload);
                
                socket.emit("negotiation", { 
                    roomID, 
                    type: "answer", 
                    payload: answer 
                });
            } 
            else if (data.type === "candidate") {
                await webrtc.addIceCandidate(data.payload);
            }
        });

        return () => {
            socket.emit("controllerDisconnected", roomID);
            socket.off("connect");
            socket.off("controllerConnected");
            socket.off("negotiation");
            socket.disconnect();
            webrtc.close();
        }
    }, [roomID]);

    // Accesso diretto senza ID (Errore)
    if (!roomID) { 
        return (
            <PageLayout>
                <div className="error-card">
                    <span className="error-icon">⚠️</span>
                    <h2 className="error-title">Accesso Negato</h2>
                    <p className="error-text">
                        Non puoi accedere a questa pagina direttamente. 
                        Manca l'ID della sessione.
                    </p>
                    <div className="instruction-box">
                        <strong>Come risolvere:</strong><br/>
                        Apri la pagina <u>Host</u> sul tuo PC e scansiona il 
                        <strong> QR Code</strong> con la fotocamera.
                    </div>
                </div>
            </PageLayout>
        ); 
    }

    // PLACEHOLDER
    return (
        <PageLayout>
            <div className="controller-icon">📱</div>
            <h2 className="page-title" style={{ fontSize: '2rem' }}>Controller Mobile</h2>
            
            <p className="loading-text" style={{ marginTop: 0 }}>
                Stato: <span className="highlight">{connectionStep}</span>
            </p>
            
            <p style={{ color: '#555', marginTop: '10px' }}>
                Room ID: <strong>{roomID}</strong>
            </p>
            
            <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#666' }}>
                (L'interfaccia di gioco apparirà qui dopo la connessione P2P)
            </div>
        </PageLayout>
    );
};

export default Controller;