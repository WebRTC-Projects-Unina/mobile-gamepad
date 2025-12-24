import React, { useRef } from "react";
import '../../App.css';

const DPad = ({ onInput }) => {
    const intervalRefs = useRef({});

    const handlePress = (direction, pressed) => {
        // Feedback aptico (vibrazione)
        if (pressed && navigator.vibrate) {
            navigator.vibrate(30); 
        }
        
        if (pressed) {
            // Invia immediatamente il primo messaggio
            if (onInput) {
                onInput('fast', { 
                    type: 'DPAD', 
                    key: direction, 
                    pressed: true 
                });
            }

            // Avvia l'intervallo per inviare messaggi ogni 0.1 secondi (100ms)
            intervalRefs.current[direction] = setInterval(() => {
                if (onInput) {
                    onInput('fast', { 
                        type: 'DPAD', 
                        key: direction, 
                        pressed: true 
                    });
                }
            }, 100);
        } else {
            // Interrompi l'invio dei messaggi quando il tasto viene rilasciato
            if (intervalRefs.current[direction]) {
                clearInterval(intervalRefs.current[direction]);
                delete intervalRefs.current[direction];
            }
        }
    };

    const renderButton = (direction, className, label) => (
        <button
            className={`dpad-btn ${className}`}
            onTouchStart={(e) => { e.preventDefault(); handlePress(direction, true); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePress(direction, false); }}
            onMouseDown={() => handlePress(direction, true)} // Fallback per debug su PC
            onMouseUp={() => handlePress(direction, false)} // Fallback per debug su PC
            onMouseLeave={() => handlePress(direction, false)} 
        >
            {label}
        </button>
    );

    return (
        <div className="dpad-container">
            <div className="dpad-center"></div>
            {renderButton('UP', 'dpad-up', '▲')}
            {renderButton('LEFT', 'dpad-left', '◀')}
            {renderButton('RIGHT', 'dpad-right', '▶')}
            {renderButton('DOWN', 'dpad-down', '▼')}
        </div>
    );
};

export default DPad;