import React from 'react';
import '../App.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import * as XLSX from "xlsx";

export default class LawsInfo extends React.Component {
  state = {
    activeTab: 0, 
    selectedValues: {},
    renderKey: 0,
  };

  handleTabChange = (_, newValue) => {
    this.setState({ activeTab: newValue });

    if (this.props.onTabChange) {
      this.props.onTabChange(newValue == 1); 
    }
  };


  handleRadioChange = (question, variableName, displayValue, code) => {
    const selectedValues = { ...this.state.selectedValues };
    // Store both display text and numeric code
    selectedValues[variableName] = { question, value: displayValue, code };
    this.setState({ selectedValues }, () => {
      if (this.props.onVariableSelect) {
        // Pass the entire selectedValues object
        this.props.onVariableSelect({ ...this.state.selectedValues });
      }
    });
  };
  
  handleCheckboxChange = (question, variableName, displayValue, code) => {
    const selectedValues = { ...this.state.selectedValues };
    // For these binary checkboxes, treat them like a toggle (single value)
    selectedValues[variableName] = { question, value: displayValue, code };
    this.setState({ selectedValues }, () => {
      if (this.props.onVariableSelect) {
        this.props.onVariableSelect({ ...this.state.selectedValues });
      }
    });
  };
  
  // 🔹 Reset everything the user has selected
  handleReset = () => {
    this.setState(
    { selectedValues: {}, renderKey: this.state.renderKey + 1 },
    () => {
      // Tell the parent that nothing is selected any more
      if (this.props.onVariableSelect) {
        this.props.onVariableSelect({});
      }
    });
  };

  

  
  handleQuestionClick = (variableName) => {
    console.log('Variable selected:', variableName);
    this.setState({ selectedValues: {} }, () => {
      if (this.props.onVariableSelect) {
        // Pass the variable name and a null value (questions mode)
        this.props.onVariableSelect(variableName, null);
      }
    });
  };

  handleSave = (mode = "filtered") => {
    const { csvData, fipsData, selectedDate } = this.props;
    const { selectedValues } = this.state;
  
    if (!csvData || !fipsData) {
      alert("Required data missing.");
      return;
    }
  
    const allStates = new Set();
    Object.values(csvData.variables).forEach(variable => {
      variable.states.forEach(s => allStates.add(s.state));
    });
  
    let matchingStates;
    if (mode === "filtered") {
      matchingStates = Array.from(allStates).filter(stateName =>
        Object.entries(selectedValues).every(([varKey, { code }]) => {
          const variable = csvData.variables[varKey];
          if (!variable) return false;
          const entries = variable.states.filter(s => s.state === stateName);
          if (!entries.length) return false;
          return entries.at(-1).value == code;
        })
      );
    } else {
      matchingStates = Array.from(allStates);
    }
  
    const fipsRows = fipsData.filter(row => matchingStates.includes(row["State"]));
    if (!fipsRows.length) {
      alert("No matching counties found.");
      return;
    }
  
    const rows = fipsRows.map(row => {
      const state = row["State"];
      const county = row["County Name"];
      const stateCode = String(row["FIPS State"]).padStart(2, "0");
      const countyCode = String(row["FIPS County"]).padStart(3, "0");
  
      const output = {
        Fips_county_code: `${stateCode}${countyCode}`,
        county,
        state,
        selected_date: selectedDate.toISOString().split("T")[0],
      };
  
      Object.entries(csvData.variables).forEach(([varKey, variable]) => {
        const entry = variable.states
          .filter(s => s.state === state)
          .at(-1);
        if (mode === "filtered") {
          if (selectedValues[varKey]) output[varKey] = 1;
        } else {
          output[varKey] = entry?.value ?? ".";
        }
      });
  
      return output;
    });
  
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  
    const tag = mode === "filtered" ? "filtered" : "all";
    const filename = `${tag}_counties_${selectedDate.toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  
  removeSelectedFilter = (variableName, valueToRemove) => {
    const selectedValues = { ...this.state.selectedValues };
    if (!selectedValues[variableName]) return;

    delete selectedValues[variableName];
  this.setState({ selectedValues, renderKey: this.state.renderKey + 1 }, () => {
    if (this.props.onVariableSelect) {
      this.props.onVariableSelect({ ...this.state.selectedValues });
    }
  });
    // const entry = selectedValues[variableName];
  
    // if (!Array.isArray(entry.value)) {
    //   // 🔹 For radios: Remove the entry and trigger a re-render
    //   delete selectedValues[variableName];
    //   this.setState({ selectedValues, renderKey: this.state.renderKey + 1 }, () => {
    //     if (this.props.onVariableSelect) {
    //       this.props.onVariableSelect(variableName, null);
    //     }
    //   });
    // } else {
    //   // 🔹 For checkboxes: Remove only one value from the array
    //   const indexToRemove = entry.value.indexOf(valueToRemove);
    //   if (indexToRemove > -1) {
    //     const newValue = [
    //       ...entry.value.slice(0, indexToRemove),
    //       ...entry.value.slice(indexToRemove + 1)
    //     ];
    //     const newCodes = [
    //       ...entry.codes.slice(0, indexToRemove),
    //       ...entry.codes.slice(indexToRemove + 1)
    //     ];
    //     if (newValue.length === 0) {
    //       delete selectedValues[variableName];
    //     } else {
    //       selectedValues[variableName] = { ...entry, value: newValue, codes: newCodes };
    //     }
    //     this.setState({ selectedValues }, () => {
    //       if (this.props.onVariableSelect) {
    //         this.props.onVariableSelect(variableName, newCodes);
    //       }
    //     });
    //   }
    // }
  };
  
  // removeSelectedFilter = (variableName, valueToRemove) => {
  //   const selectedValues = { ...this.state.selectedValues };
  //   if (!selectedValues[variableName]) return;
  //   delete selectedValues[variableName];
  //   this.setState({ selectedValues }, () => {
  //     if (this.props.onVariableSelect) {
  //       this.props.onVariableSelect(variableName, null);
  //     }
  //   });
  // };
  
  
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
            }} onClick={() =>{
              if (questionData.variables.length > 0) {
              this.handleQuestionClick(questionData.variables[0].name);
              }
            }
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
                  (variable) => variable.name == e.target.value
                );
                if (selectedVariable) {
                  const varKey = selectedVariable.var_name || selectedVariable.name;
                  this.handleQuestionClick(varKey);
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
        {this.renderSelectedFilters()}
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
            {questionData.variables.length == 1 ? (
              <div>
                {questionData.variables[0].labels.map((label, idx) => {
                  const variableName = questionData.variables[0].name;
                  const radioSelected =
                    this.state.selectedValues[variableName] &&
                    this.state.selectedValues[variableName].value == label.value;
                  return (
                    <label key={idx} style={{ marginRight: '10px' }}>
                      <input
                        type="radio"
                        name={`question_${index}`}
                        value={label.label}
                        style={{ marginRight: '5px' }}
                        key={this.state.renderKey}
                        checked={radioSelected}
                        onClick={(e) =>{
                          if (radioSelected) {
                            e.preventDefault();
                            this.removeSelectedFilter(variableName, label.value);
                            
                            if (this.props.onVariableSelect) {
                              this.props.onVariableSelect(variableName, null);
                            }
                          } else {
                          this.handleRadioChange(questionData.question,questionData.variables[0].name, label.value,parseInt(label.label))
                          }
                        }}
                      />
                      {label.value}
                      <br/>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                {questionData.variables.map((variable, idx) => {
                  const varKey = variable.var_name || variable.name;
                  // Find the "Yes" label (with code "1") from the labels array
                  const yesLabel =
                    variable.labels.find((label) => label.label == "1") ||
                    variable.labels[1]; // fallback if needed

                  const isChecked =
                    this.state.selectedValues[varKey] &&
                    this.state.selectedValues[varKey].value == yesLabel.value;

                  return (
                    <div key={idx}>
                      <label>
                        <input
                          type="checkbox"
                          name={`variable_${index}_${idx}`}
                          value={yesLabel.label}
                          style={{ marginRight: '5px' }}
                          checked={isChecked}
                          onChange={() => {
                            // Toggle the checkbox:
                            // console.log('variable name:', varKey);
                            if (isChecked) {
                              // Unselect: remove the filter and pass null for color logic
                              this.removeSelectedFilter(varKey, yesLabel.value);
                              if (this.props.onVariableSelect) {
                                this.props.onVariableSelect(varKey, null);
                              }
                            } else {
                              // Select: use the proper display text ("Yes") and numeric code (parsed from label)
                              this.handleCheckboxChange(
                                questionData.question,
                                varKey,
                                yesLabel.value, // Display text for chip ("Yes")
                                parseInt(yesLabel.label, 10) // Numeric code (1)
                              );
                            }
                          }}
                        />
                        {variable.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  renderSelectedFilters() {
    const { selectedValues } = this.state;
    const entries = Object.entries(selectedValues);
  
    // If nothing selected, show nothing
    if (!entries.length) return null;
  
    // Basic "chip" styling
    const chipStyle = {
      display: 'inline-block',
      backgroundColor: '#e0e0e0',
      borderRadius: '16px',
      padding: '4px 8px',
      margin: '4px',
    };
    const chipTextStyle = { marginRight: '8px' };
    const xStyle = {
      cursor: 'pointer',
      fontWeight: 'bold',
      marginLeft: '4px',
    };
  
    return (
      <div
        style={{
          marginBottom: '10px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography
          variant="h6"
          style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}
        >
          Selected Filters
        </Typography>
  
        {entries.map(([variableName, { question, value }]) => {
          // For radio, value is a single string; for checkbox, it's an array
          if (Array.isArray(value)) {
            // Multiple "chips" for checkbox values
            return value.map((val, idx) => (
              <div key={idx} style={chipStyle}>
                <span style={chipTextStyle}>
                  {question}: {val}
                </span>
                <span
                  style={xStyle}
                  onClick={() => this.removeSelectedFilter(variableName, val)}
                >
                  x
                </span>
              </div>
            ));
          } else {
            // Single chip for radio
            return (
              <div key={variableName} style={chipStyle}>
                <span style={chipTextStyle}>
                  {question}: {value}
                </span>
                <span
                  style={xStyle}
                  onClick={() => this.removeSelectedFilter(variableName, value)}
                >
                  x
                </span>
              </div>
            );
          }
        })}

        {/* <Button
          variant="outlined"
          size="small"
          style={{ marginTop: '10px' }}
          onClick={this.handleSaveMatchedStates}
        >
          Save
        </Button> */}

      </div>
    );
  }
  
  

  render() {
    const { parsedData, width, height } = this.props;
    const { activeTab } = this.state;

    if (!parsedData || !parsedData.questions || parsedData.questions.length == 0) {
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
        {/* 🔹 New RESET button */}
        <Button
          className="reset-btn"
          variant="text"
          // size="small"
          onClick={this.handleReset}
        >
          RESET
        </Button>
        {Object.keys(this.state.selectedValues).length > 0 && (
          <Button
            variant="text"
            color="primary"
            onClick={() => this.handleSave("filtered")}
          >
            SAVE
          </Button>
        )}
        <Button
            variant="text"
            color="primary"
            onClick={() => this.handleSave("all")}
          >
            SAVE All
          </Button>
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
          {activeTab == 0
            ? this.renderQuestionsOnly(parsedData) :this.renderFilters(parsedData)}
        </div>
      </div>
    );
  }
}