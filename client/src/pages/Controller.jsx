import React from 'react';
import { useSearchParams } from 'react-router-dom';

const Controller = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('room');

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
    if (!roomId) {
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
                {/* Simulazione caricamento */}
                <div style={{ fontSize: '3rem' }}>📱</div>
                <h2 style={styles.loadingText}>Inizializzazione Controller...</h2>
                <p style={{ color: '#888', marginTop: '10px' }}>
                    Target Room: <strong>{roomId}</strong>
                </p>
                <br/>
                <small style={{ color: '#555' }}>
                    (La connessione Socket.IO e WebRTC avverrà qui nel prossimo step)
                </small>
            </div>
        </div>
    );
};

export default Controller;