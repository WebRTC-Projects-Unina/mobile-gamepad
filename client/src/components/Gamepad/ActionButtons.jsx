import React from 'react';
import '../../App.css';

const ActionButtons = ({ onInput }) => {
    const handlePress = (key, pressed) => {
        if (pressed && navigator.vibrate) {
            navigator.vibrate(50); // Vibrazione breve (50ms)
        }

        if (onInput) {
            onInput('reliable', { 
                type: 'BUTTON', 
                key: key, 
                pressed: pressed 
            });
        }
    };

    return (
        <div className="action-buttons-container">
            <button
                className="game-btn btn-b"
                onTouchStart={(e) => { e.preventDefault(); handlePress('B', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePress('B', false); }}
                onMouseDown={() => handlePress('B', true)} // Fallback per debug su PC
                onMouseUp={() => handlePress('B', false)}
            >
                B
            </button>

            <button
                className="game-btn btn-a"
                onTouchStart={(e) => { e.preventDefault(); handlePress('A', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePress('A', false); }}
                onMouseDown={() => handlePress('A', true)}
                onMouseUp={() => handlePress('A', false)}
            >
                A
            </button>
        </div>
    );
};

export default ActionButtons;