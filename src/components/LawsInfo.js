import React from 'react';
import '../App.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

export default class LawsInfo extends React.Component {
  state = {
    activeTab: 0, 
  };

  handleTabChange = (_, newValue) => {
    this.setState({ activeTab: newValue });

    if (this.props.onTabChange) {
      this.props.onTabChange(newValue === 1); 
    }
  };

  handleRadioChange = (variableName, value) => {
    const selectedValues = { ...this.state.selectedValues, [variableName]: value };
    this.setState({ selectedValues });

    if (this.props.onVariableSelect) {
      this.props.onVariableSelect(variableName, value);
    }
  };

  handleCheckboxChange = (variableName, value) => {
    const selectedValues = { ...this.state.selectedValues };
    if (!selectedValues[variableName]) {
      selectedValues[variableName] = [];
    }

    if (selectedValues[variableName].includes(value)) {
      selectedValues[variableName] = selectedValues[variableName].filter((v) => v !== value);
    } else {
      selectedValues[variableName].push(value);
    }

    this.setState({ selectedValues });

    if (this.props.onVariableSelect) {
      this.props.onVariableSelect(variableName, selectedValues[variableName]);
    }
  };

  handleQuestionClick = (variableName) => {
    console.log('Variable selected:', variableName);
    if (this.props.onVariableSelect) {
      this.props.onVariableSelect(variableName, null);
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
                      onChange={() =>
                        this.handleRadioChange(questionData.variables[0].name, parseInt(label.label))
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
                        onChange={() => this.handleCheckboxChange(variable.var_name, '1')}
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
