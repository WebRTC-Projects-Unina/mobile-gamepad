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
        <div className="qr-component-container">
            <QRCodeCanvas 
                value={controllerUrl} 
                size={256}             
                level={"H"}
                includeMargin={true}   
            />
            
            <p className="qr-info-text">
                Inquadra col telefono o vai su:
                <br/>
                <a href={controllerUrl} target="_blank" rel="noopener noreferrer" className="qr-link">
                    {controllerUrl}
                </a>
            </p>
        </div>
    );
};

export default QRCodeDisplay;