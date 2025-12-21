
# WebRTC P2P Remote Controller

Questo progetto è una Proof of Concept per usare le tecnologie WebRTC.
L'obiettivo è trasformare uno smartphone in un gamepad virtuale a bassa latenza per controllare un'applicazione web su PC (Host), utilizzando una connessione Peer-to-Peer diretta senza server intermediari per il transito dei dati di input.

## Architettura generale dell'applicazione

Il sistema si compone di tre elementi principali:

1. Signaling Server publico:
    - Funge da punto di incontro iniziale tra host e controller
    - Gestisce lo scambio JSEP per avviare i data channel
    - Non riceve/inoltra i dati di gioco 
1. Host Client (PC Browser):
    - Inizia la sessione (funge da offerer)
    - Riceve e visualizza/usa gli input mandati dal controller
1. Remote Client (Mobile Browser):
    - Si unisce alla sessione (answerer)
    - Cattura gli eventi touch e li manda all'Host

## Stack Tecnologico

- Frontend sviluppato con il framework React per una gestione efficiente dell'UI
- Signaling server implementato con NodeJS + Express + Socket.IO per avere velocemente un server e permettere la comunicazione iniziale tra i due peer
- Comunicazione P2P realizzata con i data channel per avere flessibilità nell'uso (canale reliable per input critici e fast per input continui) e permettere di avere connessioni con latenza real time. Per ottenere i candidati ICE server-reflexive necessari per la negoziazione iniziale si contattano dei server STUN

## Struttura del progetto 

Di seguito si riporta la struttura dei file e delle directory principali

    webrtc-remote-controller/
    ├── server.js               # Signaling Server (Gestisce stanze e handshake)
    ├── client/                 # Frontend React Application
    │   ├── src/
    │   │   ├── pages/
    │   │   │   ├── Host.jsx        # Interfaccia PC (Ricevitore + QR Code)
    │   │   │   ├── Controller.jsx  # Interfaccia Mobile (Gamepad + Input Sender)
    │   │   │   └── LandingPage.jsx # Smistamento utenti
    │   │   ├── services/
    │   │   │   ├── socket.js       # Client Socket.IO
    │   │   │   └── webrtc.js       # Logica Core WebRTC (DataChannels, ICE)
    │   │   └── components/     # Componenti UI (QRCode, Layout, ecc.)

### Installazione

L'unico prerequisito è NodeJS v16+. Bisogna effettuare il setup sia del server che del frontend eseguendo in `/` e in `/client`

    npm install

Per avviare:

    npn server.js

e aprire `localhost:3000` o la macchina che sta eseguendo il server.
Si viene automaticamente reindirizzati alla pagina adeguata al dispositivo che contatta il server. Nel caso in cui sia uno smartphone, un messaggio d'errore è normale in quanto bisognerebbe scannerizzare il qr per sapere a quale host connettersi e non contattare direttamente il server. 


