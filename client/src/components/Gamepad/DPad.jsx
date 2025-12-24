import React from "react";
import '../../App.css';

const DPad = ({ onInput }) => {
    const handlePress = (direction, pressed) => {
        // Feedback aptico (vibrazione)
        if (pressed && navigator.vibrate) {
            navigator.vibrate(30); 
        }
        
        if (onInput) {
            // Usa il canale 'fast' (UDP-like) come abbiamo indicato nel design in webrtc.js
            onInput('fast', { 
                type: 'DPAD', 
                key: direction, 
                pressed: pressed 
            });
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