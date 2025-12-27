class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.dataChannels = {
            fast: null,     // simil UDP, per azioni continue (es: movimento)
            reliable: null  // simil TCP, per azioni critiche (es: sparare)
        };
        this.localStream = null; // Stream audio locale

        this.pendingIceCandidates = []; // Buffer candidati ICE in attesa di remoteDescription
        this.remoteDescriptionSet = false; // Traccia quando remoteDescription è pronta

        // Server STUN publici di google e server TURN e STUN di open relay per NAT più restrittivi
        this.config = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },     
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                {
                    urls: "turn:standard.relay.metered.ca:80",
                    username: "a6a2bb47a4c58323b684be60",
                    credential: "P0fcHGiYULKJycoX",
                },
                {
                    urls: "turn:standard.relay.metered.ca:80?transport=tcp",
                    username: "a6a2bb47a4c58323b684be60",
                    credential: "P0fcHGiYULKJycoX",
                },
                {
                    urls: "turn:standard.relay.metered.ca:443",
                    username: "a6a2bb47a4c58323b684be60",
                    credential: "P0fcHGiYULKJycoX",
                },
                {
                    urls: "turns:standard.relay.metered.ca:443?transport=tcp",
                    username: "a6a2bb47a4c58323b684be60",
                    credential: "P0fcHGiYULKJycoX",
                },
            ],
            iceTransportPolicy: "all"
        };
    }

    /**
     * Inizializza la connessione peer RTC dal lato host.
     * Crea anche i datachannel e li inizializza.
     * @param {Function} onIceCandidate - Callback per inviare i candidati al signaling server
     * @param {Function} onTrack - Callback per quando arriva uno stream audio
     * @param {Function} onMessage - Callback per gestire i messaggi in arrivo
     */
    initOfferer(onIceCandidate, onTrack, onMessage) {
        if (this.peerConnection) this.close();

        this.peerConnection = new RTCPeerConnection(this.config);

        // Assicura che l'offerta includa un m-line audio per ricevere il microfono remoto
        this.peerConnection.addTransceiver("audio", { direction: "recvonly" });

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidate(event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            onTrack(event.streams[0]);
        };

        this.createDataChannels(onMessage)
    }

    createDataChannels(onMessage) {
        this.dataChannels.fast = this.peerConnection.createDataChannel("fast", {
            ordered: false,
            maxRetransmits: 0 
        });
        this.setupChannelListeners(this.dataChannels.fast, onMessage);

        this.dataChannels.reliable = this.peerConnection.createDataChannel("reliable", {
            ordered: true
        });
        this.setupChannelListeners(this.dataChannels.reliable, onMessage);
    }

    setupChannelListeners(channel, onMessage) {
        channel.onopen = () => console.log(`Canale '${channel.label}' APERTO`);
        channel.onclose = () => console.log(`Canale '${channel.label}' CHIUSO`);
        
        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(channel.label, data);
            } catch (e) {
                console.error("Errore parsing dati WebRTC:", e);
            }
        };
    }

    /**
     * Inizializza la connessione peer RTC dal lato controller
     * @param {Function} onIceCandidate - Callback per inviare i candidati al signaling server
     * @param {Function} onOpen - Callback quando il data channel si apre
     */
    async initAnswerer(onIceCandidate, onOpen) {
        if (this.peerConnection) this.close();

        this.peerConnection = new RTCPeerConnection(this.config);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidate(event.candidate);
            }
        };

        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            
            channel.onopen = () => {
                console.log(`Canale '${channel.label}' APERTO`);
                onOpen();
            };            
            channel.onclose = () => console.log(`Canale '${channel.label}' CHIUSO`);

            if (channel.label === "fast") this.dataChannels.fast = channel;
            if (channel.label === "reliable") this.dataChannels.reliable = channel;
        };

        await this.startAudioStream();
    }

    /**  
     * Chiede il permesso per il microfono e aggiunge la traccia alla connessione.
     * Inizialmente il microfono è comunque disabilitato
     * @returns se ha ottenuto i permessi
     */
    async startAudioStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            this.enableAudio(false);
            return true;
        } catch (err) {
            console.error("Errore accesso microfono:", err.name, err.message);
            console.error("Dettagli errore:", err);
            this.localStream = null;
            return false;
        }
    }

    /**
     * @returns Se lo stream audio è stato attivato
     */
    isAudioStreamActive() {
        return !(this.localStream === null);
    }

    /**
     * Permette di attivare o disattivare l'audio
     * @param {boolean} isEnabled - se attivare o disattivare l'audio 
     */
    enableAudio(isEnabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = isEnabled; 
            });
        }
    }

    /**
     * Invia dati sul canale specificato.
     * @param {string} type - 'fast' o 'reliable'
     * @param {object} payload - Oggetto dati da inviare
     */
    sendData(type, payload) {
        const channel = this.dataChannels[type];
        if (channel && channel.readyState === "open") {
            channel.send(JSON.stringify(payload));
        } else {
            console.warn(`Canale ${type} non pronto per l'invio.`);
        }
    }
    
    // --- Funzioni per HANDSHAKE JSEP (Offer/Answer) ---

    /**
     * Crea l'offerta per la negoziazione JSEP.
     * Da chiamare dopo initOfferer
     * @returns l'offerta da inviare
     */
    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    /**
     * Riceve l'offerta e crea la risposta per la negoziazione JSEP. 
     * Da chiamare dopo initAnswerer
     * @param {*} offerSDP - Offerta da salvare
     * @returns la risposta da inviare
     */
    async createAnswer(offerSDP) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP));
        this.remoteDescriptionSet = true;
        await this.flushPendingIce();
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    /**
     * Riceve la risposta e la salva.
     * Da chiamare dopo createOffer e dopo aver ricevuto la risposta
     * @param {*} answerSDP - Risposta da salvare
     */
    async setRemoteAnswer(answerSDP) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
        this.remoteDescriptionSet = true; // Marca che remoteDescription è pronta
        await this.flushPendingIce();
    }

    /**
     * Aggiunge un candidato ICE. 
     * Se ancora non è possibile aggiungerlo allora viene bufferizzato
     * @param {*} candidate - Candidato da aggiungere
     */
    async addIceCandidate(candidate) {
        if (!this.peerConnection) return;
        try {
            if (this.remoteDescriptionSet) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                // RemoteDescription non ancora impostata: bufferizziamo
                this.pendingIceCandidates.push(candidate);
            }
        } catch (e) {
            console.error("Errore aggiunta ICE Candidate:", e);
        }
    }

    async flushPendingIce() {
        if (!this.peerConnection || !this.remoteDescriptionSet) return;
        if (!this.pendingIceCandidates.length) return;
        const toAdd = this.pendingIceCandidates.splice(0);
        for (const c of toAdd) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
                console.error("Errore durante flush ICE candidate:", e);
            }
        }
    }

    /**
     * Effettua un cleanup per poter riusare da capo la classe. 
     * Chiude data channels, ferma audio stream e chiude connessione p2p
     */
    close() {
        if (this.dataChannels.fast) this.dataChannels.fast.close();
        if (this.dataChannels.reliable) this.dataChannels.reliable.close();
        this.dataChannels = { fast: null, reliable: null };

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.remoteDescriptionSet = false; // Reset per riuso
        this.pendingIceCandidates = []; // Pulisci buffer
    }
}

export default new WebRTCService(); // Singleton