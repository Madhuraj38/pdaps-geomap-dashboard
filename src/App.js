import './App.css';
import React from 'react';
import Home from './components/Home';
import GeoMap from './components/GeoMap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <div className='navbar'><h1>Opiod Laws</h1></div>
        <Routes>
          <Route path='/' exact element={<Home/>} />
          <Route path='/geomap' element={<GeoMap/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
