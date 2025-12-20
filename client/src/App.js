import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Host from "./pages/Host"
import Controller from "./pages/Controller"

function App() {
    return (
        <BrowserRouter>
            <div className='App'>
                <Routes>
                    {/* Home provvisoria per vedere se sei Host o Controller, andrà aggiornata */}
                    <Route path='/' element = {
                        <div style={{textAlign: "center", marginTop: "50px"}}>
                            <h1>Ciao</h1>
                            <Link to="./host"><button style={{ padding: "20px", fontSize:"20px" }}>Sono l'Host (PC)</button></Link>
                        </div>
                    }/>


                    <Route path='/host' element = { <Host />} />

                    <Route path='/controller' element = { <Controller/>} />
                    
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;