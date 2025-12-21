import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeDisplay = ({ roomId }) => {
    // Trova l'indirizzo base. Esempio: http://192.168.1.50:3000/controller?room=ABCD
    // ATTENZIONE: In locale, window.location.hostname darà 'localhost'.
    const protocol = window.location.protocol; 
    const host = window.location.hostname;     
    const port = window.location.port;         

    const controllerUrl = `${protocol}//${host}:${port}/controller?room=${roomId}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
            <QRCodeCanvas 
            value={controllerUrl} 
            size={256}             
            level={"H"}            // Livello correzione errori (High)
            includeMargin={true}  
            />
        </div>
        
        <p style={{ marginTop: '15px', color: '#555', wordBreak: 'break-all' }}>
            Inquadra col telefono o vai su:<br/>
            <a href={controllerUrl} target="_blank" rel="noopener noreferrer">{controllerUrl}</a>
        </p>
        </div>
    );
};

export default QRCodeDisplay;