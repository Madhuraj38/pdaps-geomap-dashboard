import './App.css';
import React,  { useState, useEffect } from 'react';
import Home from './components/Home';
import GeoMap from './components/GeoMap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [parsedData, setParsedData] = useState(null);
  const [csvData, setCsvData] = useState(null);

  const handleParsePdf = async (buttonText) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/parse-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ buttonText })  // Send button text as payload
        });
        
        if (!response.ok) {
            throw new Error('Failed to parse PDF');
        }

        const data = await response.json();
        console.log("inside app")
        console.log(data)
        setParsedData(data); // Update state with JSON data
        return data
    } catch (err) {
        console.error('Error fetching parsed data:', err);
        setParsedData(null); // Clear previous data if an error occurs
        return null;
    }
};

const handleParseDataset = async (buttonText) => {
  try {
      const response = await fetch('http://127.0.0.1:5000/parse-data', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ buttonText })  // Send button text as payload
      });
      
      if (!response.ok) {
          throw new Error('Failed to parse dataset');
      }

      const data = await response.json();
      console.log("inside app")
      console.log(data)
      setCsvData(data); // Update state with JSON data
      return data
  } catch (err) {
      console.error('Error fetching parsed data:', err);
      setCsvData(null); // Clear previous data if an error occurs
      return null;
  }
};

  return (
    <div className="App">
      <Router>
        <div className='navbar'><h1>Opioid Laws</h1></div>
        <Routes>
          <Route path='/' exact element={<Home handleParsePdf={handleParsePdf} handleParseDataset={handleParseDataset}/>} />
          <Route path='/geomap' element={<GeoMap />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
