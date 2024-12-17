import React from 'react';
import * as d3 from "d3";
import '../App.css';
import Map from "./Map"
import { withRouter } from './withRouter';
import MapLegend from './MapLegend';
import LawsInfo from './LawsInfo';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class GeoMap extends React.Component {

  state={              
    mapBox: { width: 100, height: 100, top: 0, left: 0},
    filterBox: { width: 100, height: 100, top: 0, left: 0},
    // patternInfoBox: { width: 100, height: 100, top: 0, left: 0},
    // patternBox: { width: 100, height: 100, top: 0, left: 0}, 
    showInfo: false,
    infoText: null,
    mapData: null,
    selectedCounty: null,
    selectedCountyDetails: null,
    selectedVariable: null,
    selectedValue: null,
    isFilterTabSelected: false, 
    scaleFactor: 1,
    timeRange: [2000, 2021],
    selectedYear: 2000,
  }

  componentDidMount() {
    var headerH = 50;
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight - headerH;
    var pad = 8;
    var scaleInfo = 1;
    if( window.innerHeight > 650) {
      scaleInfo = 0.75;
    }
    
    this.setState({            
                    filterBox:
                      { 
                        width: 0.40*(winWidth - pad*3), 
                        height: 0.75*(winHeight-3*pad), 
                        top: 3*pad + 2*headerH, 
                        left: pad
                      },
                      mapBox:
                        { 
                          width: 0.55*(winWidth - pad*3), 
                          height: 0.75*(winHeight-3*pad), 
                          top: 3*pad + 2*headerH, 
                          left: 0.45*(winWidth - pad*3)
                        }
                  });

    this.loadData();

    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  onResize (){
    var headerH = 50
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight - headerH;
    var pad = 8
    var scaleInfo = 1
    if( window.innerHeight < 650) {
      scaleInfo = 0.75
    }

    this.setState({              
                  mapBox:
                    { 
                      width: 0.45*(winWidth - pad*3), 
                      height: 0.55*(winHeight-3*pad), 
                      top: 3*pad + 2*headerH, 
                      left : 0.45*(winWidth - pad*3)
                    },
                  filterBox:
                    { 
                      width: 0.30*(winWidth - pad*3), 
                        height: 0.55*(winHeight-3*pad), 
                        top: 3*pad + 2*headerH, 
                        left: pad
                    },
                    scaleFactor: scaleInfo,
                  });
  }
  
  loadData() {
    console.log("inside load");

    // const { parsedData } = this.props;
    // if (parsedData) {
    //   console.log("Received parsed data:", parsedData);
    // }

    let setState = this.setState.bind(this);
    d3.json("data/us.json").then(function(mapData) {  
      console.log("inside d3");   
      setState({mapData: mapData}); 
      console.log(mapData);
      // d3.json("data/county_stats_interpreted.json", function(countyStats) {  
      //         setState({mapData: mapData, countyStats: countyStats});
      // });    
    }).catch(function(error){
      console.log("error :",error);
    });
  }

  handleVariableSelect = (variableName, value) => {
    console.log(`Variable selected: ${variableName}, Value: ${value}`);
    this.setState({ selectedVariable: variableName, selectedValue: value });
  };

  handleTabChange = (isFilterTabSelected) => {
    console.log(`Tab changed: ${isFilterTabSelected ? 'Filters' : 'Questions'}`);
    this.setState({ isFilterTabSelected });
  };

  handleYearChange = (value) => {
    console.log(`Year selected: ${value}`);
    this.setState({ selectedYear: value });
  };

  renderTimeSlider() {
    const { timeRange, selectedYear } = this.state;

    return (
      <div className="time-slider-container">
        <div className="time-slider">
          <Slider
            min={timeRange[0]}
            max={timeRange[1]}
            defaultValue={selectedYear}
            onChange={this.handleYearChange}
            marks={{
              [timeRange[0]]: `${timeRange[0]}`,
              [timeRange[1]]: `${timeRange[1]}`,
            }}
            step={1}
          />
        </div>
        <div className="selected-year">
          <span>Selected Year: {selectedYear}</span>
        </div>
      </div>
    );
  }

  renderLegend() {
    const { isFilterTabSelected } = this.state;

    if (isFilterTabSelected) {
      return (
        <div className="legend">
          <ul className="legend-label">
            <li className="key" style={{ borderLeftColor: '#8BC34A', color: 'black' }}>
              Meets Criteria
            </li>
            <li className="key" style={{ borderLeftColor: '#d3d3d3', color: 'black' }}>
              Does Not Match 
            </li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="legend">
          <ul className="legend-label">
            <li className="key" style={{ borderLeftColor: '#2491C1', color: 'black' }}>
              Yes
            </li>
            <li className="key" style={{ borderLeftColor: '#ECCB7B', color: 'black' }}>
              No
            </li>
            <li className="key" style={{ borderLeftColor: '#d3d3d3', color: 'black' }}>
              No data 
            </li>
          </ul>
        </div>
      );
    }
  }

  render(){ 
    const parsedData = this.props.location?.state?.parsedData;
    // console.log("Parsed Data in GeoMap render:", parsedData); 
    const csvData = this.props.location?.state?.csvData;
    return (
      <div className='contentdiv'>
        <div className="content-right" /*style={this.state.mapBox}*/>
          <label class="contendDivHead">Map</label>          
          {/* <MapLegend width={200} height={35}></MapLegend> */}
          {
            
            this.state.mapData == null
            ? null
            : <Map width={this.state.mapBox.width-10} height={this.state.mapBox.height-50} padding={10} data={this.state.mapData} csvData={csvData} selectedVariable={this.state.selectedVariable} selectedValue={this.state.selectedValue}
            isFilterTabSelected={this.state.isFilterTabSelected} /*selectedYear={this.state.selectedYear}*/></Map>
          }
          {/* {
            this.state.selectedCounty == null & this.state.selectedPattern == null
            ? null
            : <input className="clear" type="button" value="Reset Selections" onClick={this.resetSelections.bind(this)} />
          } */}
          {this.renderLegend()}
        </div>
        <div className="content-left" /*style={this.state.filterBox}*/>  
          {this.renderTimeSlider()}
          <LawsInfo width={this.state.filterBox.width-10} height={this.state.filterBox.height-30} padding={10} parsedData={parsedData} onVariableSelect={this.handleVariableSelect} onTabChange={this.handleTabChange}></LawsInfo>
        </div>
      </div>
    );
  }
}

export default  withRouter(GeoMap)