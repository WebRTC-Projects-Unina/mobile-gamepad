import React, { useState } from "react";
import webrtc from "../../services/webrtc";
import '../../App.css';

const MicToggle = () => {
    const [isMuted, setIsMuted] = useState(true);

    const handleToggle = async () => {
        // Se lo stream non è ancora attivo, proviamo ad avviarlo
        if (!webrtc.localStream) {
            const success = await webrtc.startAudioStream();
            if (success) {
                // Se l'acquisizione ha successo, attiviamo l'audio
                setIsMuted(false);
                webrtc.toggleAudio(true);
            } else {
                alert("Impossibile accedere al microfono. Verifica i permessi.");
            }
        } else {
            // Se lo stream esiste già, eseguiamo il toggle
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            // toggleAudio accetta 'isEnabled', quindi passiamo !newMutedState
            webrtc.toggleAudio(!newMutedState);
        }
    };

    return (
        <button 
            className={`mic-btn ${isMuted ? 'mic-muted' : 'mic-active'}`}
            onClick={handleToggle}
            aria-label={isMuted ? "Attiva microfono" : "Disattiva microfono"}
        >
            {isMuted ? '🔇' : '🎙️'}
        </button>
    );
};

export default MicToggle;