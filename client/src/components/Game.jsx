import React, { useEffect, useState, useRef} from "react";

const Game = ({onInputReceived}) => {
    const iframeRef = useRef(null);
    const [gameStatus, setGameStatus] = useState('caricamento');
    const [isGameReady, setIsGameReady] = useState(false);
    const controlsRef = useRef({
        forward: false, // arrow up
        backward: false, // arrow down
        left: false, // arrow left
        right: false, // arrow right
        ltrigger: false, // A oppure Q
        rtrigger: false // D oppure E
    })

    const inputTimeoutsRef = useRef({});

    const processGameInput = (data) => {
        console.log("Game Input:", data);
        const iframeWindow = iframeRef.current?.contentWindow;
        if(!iframeWindow) return;

        const controls = controlsRef.current;
        
        const controlsTimer = (controlKey, pressed) => {
            controls[controlKey] = pressed;
            if (pressed) {
                if (inputTimeoutsRef.current[controlKey]) { //azzera timer
                    clearTimeout(inputTimeoutsRef.current[controlKey]);
                }
                inputTimeoutsRef.current[controlKey] = setTimeout(() => { //fai partire un nuovo timer
                    controls[controlKey] = false;
                    console.log(`Timeout scattato per ${controlKey}, valore attuale: ${controls[controlKey]}`)
                    syncGame(iframeWindow, controls);
                }, 150);
            }
        };

        if (data.type === 'DPAD') {
            switch (data.key) {
                case 'UP':
                    controlsTimer('forward', data.pressed);
                    break;
                case 'DOWN':
                    controlsTimer('backward', data.pressed);
                    break;
                case 'LEFT':
                    controlsTimer('ltrigger', data.pressed);
                    break;
                case 'RIGHT':
                    controlsTimer('rtrigger', data.pressed);
                    break;
                default:
                    break;
            }
        } else if (data.type === 'BUTTON'){
            switch (data.key) {
                case 'B':
                    controls.left = data.pressed;
                    break;
                case 'A':
                    controls.right = data.pressed;
                    break;
                default:
                    break;
            }
        }
        syncGame(iframeWindow, controls);
    };

    const syncGame = (iframeWindow, controls) => {
        try {
            const game = iframeWindow.hexGL;
            if (game && game.gameplay && game.gameplay.shipControls) {
                const gameControls = game.gameplay.shipControls;
                gameControls.key.forward = controls.forward;
                gameControls.key.backward = controls.backward;
                gameControls.key.left = controls.left;
                gameControls.key.right = controls.right;
                gameControls.key.ltrigger = controls.ltrigger;
                gameControls.key.rtrigger = controls.rtrigger;
            }
        } catch (e) {
            console.log("problemi durante il sync con il gioco")
        }
    };

    useEffect(() => {
        if (!onInputReceived) {
            return;     
        }
        const handleInput = (data) => {
            if (isGameReady && iframeRef.current) {
                processGameInput(data)
            }
        };
        onInputReceived(handleInput);
    }, [onInputReceived, isGameReady]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === "gameLoaded"){
                console.log("Gioco pronto");
                setIsGameReady(true);
                setGameStatus("Gioco pronto");
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="game-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
            <div className="game-info" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', zIndex: 100, borderRadius: '5px', pointerEvents: 'none' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#61dafb' }}>Game Control Info</h3>
                <p style={{ margin: 0 }}>Status: {gameStatus}</p>
                <small>Use the controller to play</small>
            </div>
            <iframe
                ref={iframeRef}
                src="/games/HexGL/index.html"
                title="HexGL Game"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
        </div>
    );
};

export default Game;