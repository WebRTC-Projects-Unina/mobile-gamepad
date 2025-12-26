import React, { useState } from "react";
import '../../App.css';

const MicToggle = ({webrtcInstance}) => {
    const [isEnabled, setIsEnabled] = useState(false);

    const handleToggle = () => {
        // Aggiorna solo se lo stream locale è attivo
        if (webrtcInstance.isAudioStreamActive()) {
            const newEnabledState = !isEnabled;
            console.log("Abilitazione audio:", newEnabledState);
            setIsEnabled(newEnabledState);
            webrtcInstance.enableAudio(newEnabledState);
        } else {
            console.log("Stream Audio non inizializzato");
        }
    };

    return (
        <button 
            className={`mic-btn ${isEnabled ? 'mic-active' : 'mic-muted'}`}
            onClick={handleToggle}
        >
            {isEnabled ? '🎙️' : '🔇'}
        </button>
    );
};

export default MicToggle;