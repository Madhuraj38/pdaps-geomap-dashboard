import React, { useState, useEffect } from 'react';
import '../App.css';
import { Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export default function Home({ handleParsePdf, handleParseDataset}) {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch('/data/laws.json')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleButtonClick = async (buttonText) => {
    const data = await handleParsePdf(buttonText); // Ensure the data is fetched
    console.log("inside home", data)

    const dataset = await handleParseDataset(buttonText);
    console.log("inside home dataset", dataset)
    if (data) {
      navigate('/geomap', { state: { parsedData: data } });// Navigate only when parsedData is available
    } else {
      console.error("Parsed data is null!");
  } 
};

  return (
    <div className='Home'>
      {data.map((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
          const nextRow = data[rowIndex + 1]; 

          return (
            <div className='Grid' key={rowIndex}>
              <div className='left'>
                <div className='inner-content'>
                  <h2>{row.title}</h2>
                  <p>{row.description}</p>
                  {row.buttons.map((button, index) => (
                    <Link key={index} 
                          // to="/geomap"
                          onClick={()=> handleButtonClick(button.text)}
                          // state={{ parsedData }}
                    >
                      <Button
                        className='button'
                        variant="contained"
                        color="primary"
                        sx={{
                          padding: '10px 20px',
                          bgcolor: 'skyblue',
                          width: '100%',
                          fontSize: '11px',
                          lineHeight: '1.5',
                          letterSpacing: '2px',
                          marginBottom: '10px',
                          textTransform: 'none',
                          '@media (max-width: 768px)': {
                            padding: '8px 16px',
                            fontSize: '14px',
                          },
                        }}
                        // onClick={()=> handleParsePdf(button.text)}
                      >
                        {button.text}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {nextRow && (
                <div className='right'>
                  <div className='inner-content'>
                    <h2>{nextRow.title}</h2>
                    <p>{nextRow.description}</p>
                    {nextRow.buttons.map((button, index) => (
                      <Link key={index} 
                          to="/geomap"
                          onClick={()=> handleButtonClick(button.text)}
                          // state={{ parsedData }}
                      >
                        <Button
                          className='button'
                          variant="contained"
                          color="primary"
                          sx={{
                            padding: '10px 20px',
                            bgcolor: 'skyblue',
                            width: '100%',
                            fontSize: '11px',
                            lineHeight: '1.5',
                            letterSpacing: '2px',
                            marginBottom: '10px',
                            textTransform: 'none',
                            '@media (max-width: 768px)': {
                              padding: '8px 16px',
                              fontSize: '14px',
                            },
                          }}
                          // onClick={()=> handleParsePdf(button.text)}
                        >
                          {button.text}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null; 
      })}
    </div>
  );
}
