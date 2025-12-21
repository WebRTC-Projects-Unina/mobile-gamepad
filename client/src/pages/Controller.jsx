import React, { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
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

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#20232a', 
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            textAlign: 'center'
        },
        errorCard: {
            backgroundColor: 'rgba(255, 87, 34, 0.1)', 
            border: '2px solid #ff5722',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        icon: {
            fontSize: '4rem',
            marginBottom: '20px',
            display: 'block'
        },
        title: {
            fontSize: '1.8rem',
            marginBottom: '15px',
            color: '#ff8a65'
        },
        text: {
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#e0e0e0',
            marginBottom: '20px'
        },
        instruction: {
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#aaa'
        },
        // Stili per lo stato "Pronto" (Placeholder)
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        loadingText: {
            fontSize: '1.5rem',
            marginTop: '20px',
            color: '#61dafb'
        }
    };

    // Accesso diretto senza ID (Errore)
    if (!roomID) {
        return (
            <div style={styles.container}>
                <div style={styles.errorCard}>
                    <h2 style={styles.title}>Accesso Negato</h2>
                    <p style={styles.text}>
                        Non puoi accedere a questa pagina direttamente. 
                        Manca l'ID della sessione.
                    </p>
                    <div style={styles.instruction}>
                        <strong>Come risolvere:</strong><br/>
                        Apri la pagina <u>Host</u> sul tuo PC e scansiona il 
                        <strong> QR Code</strong> con la fotocamera.
                    </div>
                </div>
            </div>
        );
    }

    // Accesso con ID 
    // PLACEHOLDER VA FINITO
    return ( 
        <div style={styles.container}>
            <div style={styles.loadingContainer}>
                <div style={{ fontSize: '3rem' }}>📱</div>
                <h2 style={styles.loadingText}>Controller Mobile</h2>
                <p style={{ color: '#aaa', marginTop: '10px' }}>
                    Stato: <strong style={{color: '#61dafb'}}>{connectionStep}</strong>
                </p>
                
                {/* Se la connessione è completa, i Data Channel si apriranno.
                   Puoi controllare la console del browser per vedere:
                   "Canale 'fast_input' APERTO"
                   "Canale 'reliable_control' APERTO"
                */}
            </div>
        </div>
    );
};

export default Controller;