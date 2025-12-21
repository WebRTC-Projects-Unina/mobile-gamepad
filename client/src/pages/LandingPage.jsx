import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const buttonStyle = {
        padding: '20px 40px',
        fontSize: '1.5rem',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        width: '250px',
        textDecoration: 'none',
        display: 'inline-block',
        margin: '10px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.1s'
    };

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#20232a',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
    }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Remote Controller</h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '50px' }}>
            Scegli il tuo dispositivo per iniziare
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <Link to="/host" style={{ textDecoration: 'none' }}>
            <div style={{ ...buttonStyle, backgroundColor: '#61dafb', color: '#20232a' }}>
                HOST
                <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
                    Crea una stanza (PC)
                </div>
            </div>
            </Link>

            {/* Nota: Di solito si accede via QR, ma utile per debug o accesso manuale */}
            <Link to="/controller" style={{ textDecoration: 'none' }}>
            <div style={{ ...buttonStyle, backgroundColor: '#ff6b6b', color: 'white' }}>
                CONTROLLER
                <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
                    DEBUG
                </div>
            </div>
            </Link>
        </div>
    </div>
  );
};

export default LandingPage;