import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeDisplay = ({ roomId }) => {
    // Trova l'indirizzo base. Esempio: http://192.168.1.50:3000/controller?room=ABCD
    // ATTENZIONE: In locale, window.location.hostname darà 'localhost'.
    const protocol = window.location.protocol; 
    const host = window.location.hostname;     
    const port = window.location.port;         

    const controllerUrl = `${protocol}//${host}:${port}/controller?room=${roomId}`;

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeIn 0.5s ease-in'
        },
        qrBox: {
            background: 'white',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 0 25px rgba(97, 218, 251, 0.4)', 
            transition: 'transform 0.3s ease'
        },
        text: {
            marginTop: '25px',
            color: '#aaa', 
            wordBreak: 'break-all',
            textAlign: 'center',
            fontSize: '1rem',
            lineHeight: '1.5',
            maxWidth: '300px'
        },
        link: {
            color: '#61dafb', 
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '5px',
            display: 'block',
            fontSize: '0.9rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.qrBox}>
                <QRCodeCanvas 
                value={controllerUrl} 
                size={256}             
                level={"H"}            // Livello correzione errori (High)
                includeMargin={true}  
                />
            </div>
        
            <p style={styles.text}>
                Inquadra col telefono o vai su:<br/>
                <a href={controllerUrl} target="_blank" rel="noopener noreferrer" style={styles.link}> 
                    {controllerUrl}
                </a>
            </p>
        </div>
    );
};

export default QRCodeDisplay;