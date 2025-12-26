class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.dataChannels = {
            fast: null,     // simil UDP, per azioni continue (es: movimento)
            reliable: null  // simil TCP, per azioni critiche (es: sparare)
        };
        this.localStream = null; // Stream audio locale

        this.config = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" }
            ]
        };
    }

    /**
     * Inizializza la RTCPeerConnection.
     * @param {Function} onIceCandidate - Callback per inviare i candidati al signaling server
     * @param {Function} onTrack - (Opzionale) Callback quando arriva uno stream audio remoto (Host)
     * @param {Function} onDataChannelMsg - (Opzionale) Callback quando arrivano dati
     * @param {Function} onOpen - (Opzionale) Callback quando il data channel si apre
     * @param {Function} onNegotiationNeeded - (Opzionale) Callback quando è necessaria una rinegoziazione (es. aggiunta track)
    */
    initPeerConnection(onIceCandidate, onTrack, onDataChannelMsg, onOpen, onNegotiationNeeded) {
        if (this.peerConnection) this.close();

        this.peerConnection = new RTCPeerConnection(this.config);

        // Gestione ICE Candidates (da inviare all'altro peer)
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidate(event.candidate);
            }
        };

        if (onTrack) {
            this.peerConnection.ontrack = (event) => {
                console.log("Stream audio ricevuto!");
                onTrack(event.streams[0]);
            };
        }

        if (onNegotiationNeeded) {
            this.peerConnection.onnegotiationneeded = () => {
                console.log("Negoziazione necessaria rilevata.");
                onNegotiationNeeded();
            };
        }

        // 5. Gestione Data Channel in ingresso (Solo chi NON crea i canali, es. Controller se Host li crea)
        // Nota: Nel nostro caso l'Host crea i canali, il Controller li riceve qui.
        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            console.log(`Data Channel ricevuto: ${channel.label}`);
            
            this.setupChannelListeners(channel, onDataChannelMsg, onOpen);

            // Salviamo il riferimento per poter rispondere se necessario
            if (channel.label === "fast") this.dataChannels.fast = channel;
            if (channel.label === "reliable") this.dataChannels.reliable = channel;
        };
    }

  

    /**
     * Crea i canali dati. Deve essere chiamato dall'OFFERER (Host) prima di createOffer.
     * @param {Function} onMessage - Callback per gestire i messaggi in arrivo
     * @param {Function} onOpen - (Opzionale) Callback quando il canale si apre
     */
    createDataChannels(onMessage, onOpen) {
        if (!this.peerConnection) return;

        this.dataChannels.fast = this.peerConnection.createDataChannel("fast", {
            ordered: false,
            maxRetransmits: 0 
        });
        this.setupChannelListeners(this.dataChannels.fast, onMessage, onOpen);

        this.dataChannels.reliable = this.peerConnection.createDataChannel("reliable", {
            ordered: true
        });
        this.setupChannelListeners(this.dataChannels.reliable, onMessage, onOpen);
    }

    /**
     * Configura i listener open, close, message (per comodità parsa anche il json)
     */
    setupChannelListeners(channel, onMessage, onOpen) {
        channel.onopen = () => {
            console.log(`Canale '${channel.label}' APERTO`);
            if(onOpen) onOpen();
        };            
        channel.onclose = () => console.log(`Canale '${channel.label}' CHIUSO`);
        
        if (onMessage) {
            channel.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(channel.label, data);
                } catch (e) {
                    console.error("Errore parsing dati WebRTC:", e);
                }
            };
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
            // console.warn(`Canale ${type} non pronto per l'invio.`);
        }
    }

    // Chiede il permesso per il microfono e aggiunge la traccia alla connessione
    async startAudioStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            this.localStream.getTracks().forEach((track) => {
                // Aggiunge la traccia alla peer connection esistente quindi solleva un evento di rinegoziazione 
                this.peerConnection.addTrack(track, this.localStream);
            });
            console.log("Microfono acquisito e aggiunto allo stream.");
            return true;
        } catch (err) {
            console.error("Errore accesso microfono:", err);
            return false;
        }
    }

    toggleAudio(isEnabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = isEnabled; // Mute/Unmute hardware
            });
        }
    }

    
    // --- HANDSHAKE JSEP (Offer/Answer) ---

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    async createAnswer(offerSDP) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    async setRemoteAnswer(answerSDP) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
    }

    async addIceCandidate(candidate) {
        try {
            if (this.peerConnection && this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (e) {
            console.error("Errore aggiunta ICE Candidate:", e);
        }
    }

    // Cleanup: chiudi data channels, ferma audio stream, chiudi connessione p2p e resetta lo stato
    close() {
        if (this.dataChannels.fast) this.dataChannels.fast.close();
        if (this.dataChannels.reliable) this.dataChannels.reliable.close();

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.dataChannels = { fast: null, reliable: null };
    }
}

export default new WebRTCService(); // Singleton