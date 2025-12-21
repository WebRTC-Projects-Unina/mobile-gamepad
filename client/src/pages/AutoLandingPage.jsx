import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLandingPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Analisi del dispositivo...");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    if (isMobile) {
    setStatus("Smartphone Rilevato. Avvio Controller");
    setTimeout(() => {
        navigate('/controller');
    }, 1000);
    } else {
    setStatus("PC Rilevato. Avvio Host");
    setTimeout(() => {
        navigate('/host');
    }, 600);
    }
  }, [navigate]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#20232a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    },
    loaderContainer: {
      position: 'relative',
      width: '100px',
      height: '100px',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '50%',
      boxShadow: '0 0 20px rgba(97, 218, 251, 0.2)'
    },
    pulseRing: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '2px solid #61dafb',
      animation: 'pulse 1.5s infinite'
    },
    text: {
      fontSize: '1.5rem',
      color: '#e0e0e0',
      marginBottom: '10px'
    },
    subText: {
      fontSize: '0.9rem',
      color: '#777'
    },
    manualLink: {
      marginTop: '50px',
      color: '#61dafb',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '0.9rem',
      background: 'none',
      border: 'none'
    }
  };

  return (
    <div style={styles.container}>
      {/* Animazione CSS per il pulse */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 15px #61dafb; }
            100% { transform: scale(0.9); opacity: 0.7; }
          }
        `}
      </style>

      <div style={styles.loaderContainer}>
        <div style={styles.pulseRing}></div>
      </div>

      <h2 style={styles.text}>{status}</h2>
      <p style={styles.subText}>Reindirizzamento automatico in corso...</p>
    </div>
  );
};

export default AutoLandingPage;