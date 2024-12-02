import React from 'react';
import '../App.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

export default class LawsInfo extends React.Component {
  state = {
    activeTab: 0, // Track the active tab
  };

  handleTabChange = (_, newValue) => {
    this.setState({ activeTab: newValue });
  };

  handleQuestionClick = (variableName) => {
    // Notify parent (GeoMap.js) of the selected variable
    console.log('Variable selected:', variableName);
    if (this.props.onVariableSelect) {
      this.props.onVariableSelect(variableName);
    }
  };

  renderQuestionsOnly(parsedData) {
    return (
      <div className="questions-only">
        {parsedData.questions.map((questionData, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}>
            <Typography variant="h6" style={{
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() =>
              this.handleQuestionClick(questionData.variables[0].name)
            }>{questionData.question}</Typography>
             {questionData.variables.length > 1 && (
              <div>
              <select
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              onChange={(e) => {
                const selectedVariable = questionData.variables.find(
                  (variable) => variable.name === e.target.value
                );
                if (selectedVariable) {
                  this.handleQuestionClick(selectedVariable.var_name);
                }
              }}
            >
              <option value="" disabled selected>
                Choose an option
              </option>
              {questionData.variables.map((variable, idx) => (
                <option key={idx} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </select>
            </div>
             )}
          </div>
        ))}
      </div>
    );
  }

  renderFilters(parsedData) {
    return (
      <div className="questions-with-options">
        {parsedData.questions.map((questionData, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}
          >
            <Typography variant="h6" style={{
              fontSize: '12px',
              fontWeight: 'bold'
            }}>{questionData.question}</Typography>
            {questionData.variables.length === 1 ? (
              <div>
                {questionData.variables[0].labels.map((label, idx) => (
                  <label key={idx} style={{ marginRight: '10px' }}>
                    <input
                      type="radio"
                      name={`question_${index}`}
                      value={label.label}
                      style={{ marginRight: '5px' }}
                      onClick={() =>
                        this.handleQuestionClick(questionData.variables[0].name)
                      }
                    />
                    {label.value}
                    <br/>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                {questionData.variables.map((variable, idx) => (
                  <div key={idx}>
                    <label>
                      <input
                        type="checkbox"
                        name={`variable_${index}_${idx}`}
                        value={variable.name}
                        style={{ marginRight: '5px' }}
                        onClick={() =>
                          this.handleQuestionClick(variable.var_name)
                        }
                      />
                      {variable.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { parsedData, width, height } = this.props;
    const { activeTab } = this.state;

    if (!parsedData || !parsedData.questions || parsedData.questions.length === 0) {
      return <p>Loading...</p>;
    }

    return (
      <div className='content'>
        <Tabs
          value={activeTab}
          onChange={this.handleTabChange}
          aria-label="Questions and Filters Tabs"
        >
          <Tab label="Questions" /> 
          <Tab label="Filters" />
        </Tabs>
        <div
          className="innercontentdiv"
          style={{
            width,
            height,
            overflow: 'auto',
            padding: '10px',
            // border: '1px solid #ddd',
            textAlign: 'left',
            fontSize: '12px'
          }}
        >
          {activeTab === 0
            ? this.renderQuestionsOnly(parsedData) :this.renderFilters(parsedData)}
        </div>
      </div>
    );
  }
}
