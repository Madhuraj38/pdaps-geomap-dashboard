import React from 'react';
import '../App.css';

export default class LawsInfo extends React.Component {

  renderQuestion(questionData, index) {
    const { question, variables } = questionData;

    return (
      <div className="question" key={index} style={{ marginBottom: '20px' }}>
        {/* Display the question */}
        <h4>{question}</h4>

        {/* Check if variables array length is 1 */}
        {variables.length === 1 ? (
          <div>
            {/* Render radio buttons */}
            {variables[0].labels.map((label, idx) => (
              <label key={idx} style={{ marginRight: '10px' }}>
                <input
                  type="radio"
                  name={`question_${index}`}
                  value={label.label}
                  // style={{ marginRight: '5px' }}
                />
                {label.value}
                <br/>
              </label>
            ))}
          </div>
        ) : (
          <div>
            {/* Render checkboxes */}
            {variables.map((variable, idx) => (
              <div key={idx}>
                <label>
                  <input
                    type="checkbox"
                    name={`variable_${index}_${idx}`}
                    value={variable.name}
                    // style={{ marginRight: '5px' }}
                  />
                  {variable.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }


  render() {   
    const { parsedData } = this.props; 
    return (
        <div className="innercontentdiv" style={{width:this.props.width, height:this.props.height}}>
          Laws filtered here...
          <div className='questions'>
          {parsedData && parsedData.questions && parsedData.questions.length > 0 ? (
            parsedData.questions.map((questionData, index) =>
              this.renderQuestion(questionData, index)
            )
          ) : (
            <p>No parsed data available.</p>
          )}
          </div>
        </div>
    );
  }
}
