
# WebRTC P2P Remote Controller

Questo progetto è una Proof of Concept per usare le tecnologie WebRTC.
L'obiettivo è trasformare uno smartphone in un gamepad virtuale a bassa latenza per controllare un'applicazione web su PC (Host), utilizzando una connessione Peer-to-Peer diretta senza server intermediari per il transito dei dati di input.

Per l'idea generale e le specifiche formali si veda il documento di specifica, che descrive formalmente l'obiettivo di questo progetto e i requisiti che dovrà soddisfare; inoltre, presenta anche dei diagrammi di sequenza preliminari che sono stati usati per lo sviluppo dell'applicazione. 

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

## Servizio WebRTC

Dato che il cuore della comunicazione è realizzato da questa classe, di seguito se ne descrive l'utilizzo.

Il seguente diagramma illustra come vengono utilizzate le API della classe `webrtc.js` durante l'intero ciclo di vita della connessione P2P. Il diagramma mostra la sequenza di chiamate necessarie per stabilire la connessione tra Host e Controller, lo scambio di dati in tempo reale e la chiusura della sessione.

**Fasi principali:**
1. **Setup**: Host e Controller si connettono al signaling server
2. **Negoziazione**: L'Host inizializza come offerer e crea l'offerta SDP; il Controller risponde come answerer
3. **ICE**: Scambio dei candidati ICE per stabilire la connessione diretta
4. **Comunicazione P2P**: Invio di input e audio attraverso i data channel
5. **Cleanup**: Chiusura ordinata delle risorse

![WebRTC Class Usage Sequence Diagram](images/WebRTC%20class%20use.png)
Per un sequence diagram che segue più attentamente il codice si veda  `/images/Specific WebRTC class use.png`

### Dettagli Data Channel

La classe utilizza due data channel con caratteristiche diverse per ottimizzare la comunicazione:

| Caratteristica | Fast Channel | Reliable Channel |
|---|---|---|
| **Modalità** | Unreliable, non ordinato | Reliable, ordinato |
| **Retransmissione** | No (`maxRetransmits: 0`) | Sì |
| **Latenza** | Minima | Leggermente maggiore |
| **Uso** | Input continui (movimento) | Azioni critiche (fuoco, salto) |
| **Perdita di pacchetti** | Tollerata | Non tollerata |

**Motivazione**: Il canale **fast** è ottimizzato per input continui (es: stick analogico, movimento costante) dove la perdita occasionale di un pacchetto non compromette l'esperienza, e la bassa latenza è critica. Il canale **reliable** garantisce che azioni discrete e continuative e importanti (es: sparare, attivare power-up) arrivino sempre e nell'ordine corretto.

#### Formato dei Messaggi

I messaggi inviati su entrambi i data channel sono oggetti JSON con la seguente struttura:

**Canale Fast (D-Pad - Input continui):**
```javascript
{
    type: "DPAD",        // Identificatore del tipo di input
    key: "UP",           // Direzione (UP, DOWN, LEFT, RIGHT)
    pressed: true        // Stato del tasto (sempre true)
}
```

**Canale Reliable (Action Buttons - Azioni critiche):**
```javascript
{
    type: "BUTTON",      // Identificatore del tipo di input
    key: "A",            // Identificatore del pulsante (A, B)
    pressed: true        // Stato del tasto (true = premuto, false = rilasciato)
}
```

**Flusso di Invio:**
- **DPad (Fast Channel)**: Invia un messaggio immediatamente al press, poi ogni 100ms mentre il tasto rimane premuto. Al release, smette di inviare.
- **ActionButtons (Reliable Channel)**: Invia un messaggio sia al press che al release, garantendo che il server riceva lo stato esatto del pulsante.

## Servizio socket

Il file `socket.js` esporta un'istanza singleton di Socket.IO client configurata per connettersi al signaling server, determinando dinamicamente l'URL. La connessione è impostata con `autoConnect: false` per permettere un controllo manuale del momento della connessione. 

Questo servizio viene utilizzato da Host e Controller per:
- Gestire la creazione e l'accesso alle stanze
- Scambiare i messaggi di negoziazione WebRTC (offer, answer, ICE candidates)
- Notificare eventi di connessione/disconnessione tra i peer

## Pagine dell'Applicazione

L'applicazione è organizzata in pagine che seguono un flusso di smistamento automatico:

- **LandingPage**: Entry point principale. Rileva automaticamente il tipo di dispositivo e smista l'utente verso la pagina appropriata.
- **Host**: Interfaccia per il PC che crea una stanza, genera un QR Code e attende la connessione del controller mobile. Una volta connesso, visualizza lo stato della connessione P2P.
- **Controller**: Interfaccia per lo smartphone. Se accesso senza un `roomID` (scansionando il QR Code), mostra un errore. Una volta connesso, presenta un'interfaccia gamepad completa con D-Pad, pulsanti d'azione e controllo del microfono.

### Flusso di Accesso e Stati

Il seguente diagramma mostra come gli utenti vengono smistati automaticamente alle pagine corrette e come cambia lo stato dell'interfaccia durante il ciclo di vita della connessione:

![Pages State Diagram](images/Pages%20state%20diagram.png)

**Punti chiave:**
- La **AutoLandingPage** rileva automaticamente il dispositivo
- Il **Controller** è accessibile **solo scansionando il QR Code** generato dall'Host
- L'accesso diretto al Controller senza QR Code mostra un messaggio di errore
- Una volta stabilita la connessione P2P, entrambe le pagine visualizzano l'interfaccia di comunicazione

## Installazione e avvio

L'unico prerequisito è NodeJS v16+. Bisogna effettuare il setup sia del server che del frontend eseguendo in `/` e in `/client`

    npm install

Compilare il frontend per essere servito dal server:

    cd client
    npm run build

Avviare il server:

    cd ..
    node server.js

e aprire `localhost:3000` o la macchina che sta eseguendo il server.
Si viene automaticamente reindirizzati alla pagina adeguata al dispositivo che contatta il server. Nel caso in cui sia uno smartphone, un messaggio d'errore è normale in quanto bisognerebbe scannerizzare il qr per sapere a quale host connettersi e non contattare direttamente il server.

**Nota d'uso**: Dato l'interesse della privacy degli utenti di alcuni browser (tra cui Chrome) l'audio potrebbe non andare in quanto è forzatamente richiesto https anche solo per poter richiedere l'accesso al microfono. Per ovviare, si può effettuare un tunnel con ngrok:

    ngrok http 3000 

E contattare il link fornito


