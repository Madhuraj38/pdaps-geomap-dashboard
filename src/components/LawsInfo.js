import React from 'react';
import '../App.css';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default class LawsInfo extends React.Component {
  renderQuestion(questionData, index) {
    const { question, variables } = questionData;

    return (
      <Accordion className="accordion_item" key={index}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${index}-content`}
          id={`panel${index}-header`}
          sx={{backgroundColor: 'skyblue'}}
        >
          <Typography>{question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {variables.length === 1 ? (
            <div>
              {variables[0].labels.map((label, idx) => (
                <label key={idx} style={{ marginRight: '10px' }}>
                  <input
                    type="radio"
                    name={`question_${index}`}
                    value={label.label}
                    style={{ marginRight: '5px' }}
                  />
                  {label.value}
                  <br />
                </label>
              ))}
            </div>
          ) : (
            <div>
              {variables.map((variable, idx) => (
                <div key={idx}>
                  <label>
                    <input
                      type="checkbox"
                      name={`variable_${index}_${idx}`}
                      value={variable.name}
                      style={{ marginRight: '5px' }}
                    />
                    {variable.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }

  render() {
    const { parsedData, width, height } = this.props;
    return (
      <div
        className="innercontentdiv"
        style={{
          width,
          height,
          overflow: 'auto',
          padding: '10px',
          border: '1px solid #ddd',
        }}
      >
        <div className='questions'>
        {parsedData && parsedData.questions && parsedData.questions.length > 0 ? (
          parsedData.questions.map((questionData, index) =>
            this.renderQuestion(questionData, index)
          )
        ) : (
          <p>Loading...</p>
        )}
        </div>
      </div>
    );
  }
}
