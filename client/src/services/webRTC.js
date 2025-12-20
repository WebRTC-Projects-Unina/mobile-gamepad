class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;        // Canale per i dati veloci
    this.controlChannel = null;     // Canale per i comandi critici
    
    this.config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };
  }

  initPeerConnection(onIceCandidate, onTrack) {
    this.peerConnection = new RTCPeerConnection(this.config);

    // Gestione candidati ICE (Trickle ICE)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Gestione stream audio in arrivo (Lato Host)
    this.peerConnection.ontrack = (event) => {
      if (onTrack) onTrack(event.streams[0]);
    };
  }
  
  // Chiamato dall'Host
  createDataChannels() {
    if (!this.peerConnection) return;

    // Canale fast simil UDP, per informazioni in costante aggiornamento (movimento, etc)
    this.dataChannel = this.peerConnection.createDataChannel("fast", {
      ordered: false,
      maxRetransmits: 0
    });

    // Canale reliable simil TCP, per pressioni di tasti critici (tasti azione)
    this.controlChannel = this.peerConnection.createDataChannel("reliable");
  }

  // Chiamato dal Controller per agganciarsi ai canali creati dall'Host
  setupDataChannelListeners(onMessage) {
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      // Imposta il listener per ricevere i messaggi
      channel.onmessage = (msg) => onMessage(channel.label, msg.data);
    };
  }

  // Invia dati sul canale appropriato
  sendData(type, payload) {
    const json = JSON.stringify(payload);
    // Se è un movimento continuo -> usa canale veloce
    if (type === "fast" && this.dataChannel?.readyState === "open") {
      this.dataChannel.send(json);
    } 
    // Se è un click importante -> usa canale affidabile
    else if (type === "reliable" && this.controlChannel?.readyState === "open") {
      this.controlChannel.send(json);
    }
  }

  // Metodi per handshake, creano il payload da condividere con socket.io per fare la negoziazione iniziale 
  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;   // Da mandare con socket.io
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
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }
  
  // Aggiunge lo stream audio (Microfono)
  addLocalStream(stream) {
    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream);
    });
  }
}

export default new WebRTCService(); // Singleton