import React, { useState } from "react";
import '../../App.css';

const MicToggle = ({webrtcInstance}) => {
    const [isEnabled, setIsEnabled] = useState(false);

    const handleToggle = () => {
        // Aggiorna solo se lo stream locale è attivo
        if (webrtcInstance.isAudioStreamActive()) {
            const newEnabledState = !isEnabled;
            setIsEnabled(newEnabledState);
            webrtcInstance.enableAudio(newEnabledState);
        } else {
            console.warn("Stream Audio non inizializzato");
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