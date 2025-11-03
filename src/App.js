import './App.css';
import React,  { useState, useEffect } from 'react';
import Home from './components/Home';
import GeoMap from './components/GeoMap';
import HomeIcon from '@mui/icons-material/Home';
import DarkModeToggle from './components/DarkModeToggle';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';

function AppContent() {
  const { isDarkMode } = useDarkMode();
  const [parsedData, setParsedData] = useState(null);
  const [csvData, setCsvData] = useState(null);

  const handleParsePdf = async (buttonText) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/parse-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ buttonText })  
        });
        
        if (!response.ok) {
            throw new Error('Failed to parse PDF');
        }

        const data = await response.json();
        console.log("inside app")
        console.log(data)
        setParsedData(data); 
        return data
    } catch (err) {
        console.error('Error fetching parsed data:', err);
        setParsedData(null); 
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
          body: JSON.stringify({ buttonText }) 
      });
      
      if (!response.ok) {
          throw new Error('Failed to parse dataset');
      }

      const data = await response.json();
      console.log("inside app")
      console.log(data)
      setCsvData(data);
      return data
  } catch (err) {
      console.error('Error fetching parsed data:', err);
      setCsvData(null);
      return null;
  }
};

  return (
    <div className="App">
      <Router>
        <div className='navbar'>
        <Link to='/' className='HomeLogo' style={{ textDecoration: 'none' }}>
          <HomeIcon style={{ fontSize: '3.0rem', color: isDarkMode ? 'white' : 'black' }} />
        </Link>
          <h1>Public Health Laws</h1>
          <DarkModeToggle />
        </div>
        <Routes>
          <Route path='/' exact element={<Home handleParsePdf={handleParsePdf} handleParseDataset={handleParseDataset}/>} />
          <Route path='/geomap' element={<GeoMap />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

export default App;
