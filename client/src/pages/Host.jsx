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

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#20232a', // Stesso colore della Landing Page
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        },
        header: {
            fontSize: '3rem',
            marginBottom: '30px',
            color: '#61dafb' // Accento azzurro React (o bianco se preferisci)
        },
        statusCard: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Effetto vetro leggero
            padding: '20px 40px',
            borderRadius: '10px',
            marginBottom: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backdropFilter: 'blur(5px)'
        },
        statusText: {
            fontSize: '1.2rem',
            marginBottom: '10px'
        },
        statusIndicator: {
            color: status.includes("Connesso") ? '#4caf50' : '#ff6b6b', // Verde o Rosso (toni pastello per dark mode)
            fontWeight: 'bold',
            marginLeft: '10px'
        },
        socketId: {
            display: 'block',
            marginTop: '5px',
            color: '#aaa',
            fontSize: '0.9rem'
        },
        qrContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeIn 0.5s ease-in'
        },
        qrBackground: {
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        },
        idText: {
            marginTop: '25px',
            fontSize: '2rem',
            letterSpacing: '8px',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '10px 20px',
            borderRadius: '8px'
        },
        loadingText: {
            fontSize: '1.5rem',
            color: '#aaa',
            fontStyle: 'italic'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Modulo HOST (PC)</h1>
            
            <div style={styles.statusCard}>
                <div style={styles.statusText}>
                    <strong>Stato Socket:</strong> 
                    <span style={styles.statusIndicator}>{status}</span>
                </div>
                {socketID && <small style={styles.socketId}>Socket ID: {socketID}</small>}
            </div>

            {roomID ? (
                <div style={styles.qrContainer}>
                    <h3 style={{ marginBottom: '20px', fontWeight: 'normal' }}>
                        Scansiona per connetterti
                    </h3>
                    
                    <div style={styles.qrBackground}>
                        <QRCodeDisplay roomId={roomID} />
                    </div>
            
                    <div style={styles.idText}>
                        {roomID}
                    </div>
                </div>
            ) : (
                <p style={styles.loadingText}>Generazione stanza in corso...</p>
            )}
        </div>
    );
};

export default Host;