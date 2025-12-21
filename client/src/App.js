import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Host from "./pages/Host"
import Controller from "./pages/Controller"
import LandingPage from './pages/LandingPage';
import AutoLandingPage from './pages/AutoLandingPage';
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className='App'>
                <Routes>
                    <Route path="/" element={<AutoLandingPage />} />
                    
                    <Route path="/debug" element={<LandingPage />} /> 

                    <Route path='/host' element = { <Host />} />

                    <Route path='/controller' element = { <Controller/>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;