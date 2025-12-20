class WebRTCServices {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;        // Canale per dati veloci
        this.controlChannel = null;     // Canale per dati critici

        this.config = {
            iceServers: [
                {urls: "stud.stun.l.google.com:19301"},
                {urls: "stud.stun1.l.google.com:19301"}
            ]
        };
    }

    initPeerConnection(onIceCandidate, onTrack) {
        this.peerConnection = new RTCPeerConnection(this.config);
        this.peerConnection.onicecandidate = (event) => {
            if(event.candidate) {
                onIceCandidate(event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            if(onTrack) onTrack(event.streams[0]);
        };
    }
}

export default new WebRTCServices();    // Singleton