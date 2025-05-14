import React from 'react';
import * as d3 from "d3";
import '../App.css';
import Map from "./Map"
import { withRouter } from './withRouter';
import LawsInfo from './LawsInfo';
import TimeSlider from "./TimeSlider"; // Import the TimeSlider component
import * as XLSX from "xlsx";
// import Slider from 'rc-slider';
// import 'rc-slider/assets/index.css';

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
    selectedFilters: {},
    isFilterTabSelected: false, 
    scaleFactor: 1,
    timeRange: [],
    selectedDate: new Date(),
    isStaticData: false,
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
                        width: 0.35*(winWidth - pad*3), 
                        height: 0.75*(winHeight-3*pad), 
                        top: 3*pad + 2*headerH, 
                        left: pad
                      },
                      mapBox:
                        { 
                          width: 0.50*(winWidth - pad*3), 
                          height: 0.75*(winHeight-3*pad), 
                          top: 3*pad + 2*headerH, 
                          left: 0.45*(winWidth - pad*3)
                        }
                  });

    this.loadData();

    fetch(process.env.PUBLIC_URL + "/data/US_FIPS_Codes.xlsx")
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const fipsData = XLSX.utils.sheet_to_json(sheet, {
        header: ["State", "County Name", "FIPS State", "FIPS County"],
        range: 1, 
        defval: ""
      });
      
      this.setState({ fipsData });
    });

    const csvData = this.props.location?.state?.csvData;
    if (csvData) {
      const { timeRange, isStatic } = this.getTimeRangeFromData(csvData);
      const defaultDate = new Date(timeRange[0], 0, 1);
      this.setState({ timeRange, selectedDate: defaultDate, isStaticData: isStatic });

    }

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

  // handleVariableSelect = (variableName, value) => {
  //   console.log(`Variable selected: ${variableName}, Value: ${value}`);
  //   this.setState({ selectedVariable: variableName, selectedValue: value });
  // };
  handleVariableSelect = (arg1, arg2) => {
    if (this.state.isFilterTabSelected) {
      // Filters mode: arg1 is the full filters object.
      this.setState({ 
        selectedFilters: arg1,
        selectedVariable: null,
        selectedValue: null 
      });
    } else {
      // Questions mode: arg1 is the variableName, arg2 is (typically) null.
      this.setState({ 
        selectedVariable: arg1, 
        selectedValue: arg2,
        selectedFilters: {} // Clear any filters.
      });
    }
  };
  
  

  handleTabChange = (isFilterTabSelected) => {
    console.log(`Tab changed: ${isFilterTabSelected ? 'Filters' : 'Questions'}`);
    this.setState({ isFilterTabSelected });
  };

  handleDateChange = (newDate) => {
    this.setState({ selectedDate: newDate });
  };

  getTimeRangeFromData = (csvData) => {
    const allDates = [];
  
    if (!csvData || !csvData.variables) return { timeRange: [2000, 2021], isStatic: true };
  
    Object.values(csvData.variables).forEach(variable => {
      variable.states.forEach(stateEntry => {
        const effective = new Date(stateEntry.effective_date);
        const validThrough = new Date(stateEntry.valid_through_date);
        if (!isNaN(effective)) allDates.push(effective);
        if (!isNaN(validThrough)) allDates.push(validThrough);
      });
    });
  
    if (allDates.length == 0) return { timeRange: [2000, 2021], isStatic: true };
  
    const years = allDates.map(date => date.getFullYear());
    let minYear = Math.min(...years);
    const maxYear = Math.max(...years);
  
    const isStatic = minYear == maxYear;
  
    return { timeRange: [minYear, maxYear], isStatic };
  };
  
  
  // renderTimeSlider() {
  //   const { timeRange, selectedYear } = this.state;

  //   return (
  //     <div className="time-slider-container">
  //       <div className="time-slider">
  //         <Slider
  //           min={timeRange[0]}
  //           max={timeRange[1]}
  //           defaultValue={selectedYear}
  //           onChange={this.handleYearChange}
  //           marks={{
  //             [timeRange[0]]: `${timeRange[0]}`,
  //             [timeRange[1]]: `${timeRange[1]}`,
  //           }}
  //           step={1}
  //         />
  //       </div>
  //       <div className="selected-year">
  //         <span>Selected Year: {selectedYear}</span>
  //       </div>
  //     </div>
  //   );
  // }

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
    const lawName = this.props.location?.state?.lawName;

    return (
      <div className='contentdiv'>
        <h2>{lawName}</h2>
        <div className="content-right" /*style={this.state.mapBox}*/>
          {/* <label class="contendDivHead">Map</label>   */}
          {
            
            this.state.mapData == null
            ? null
            : <Map width={this.state.mapBox.width-10} height={this.state.mapBox.height-50} padding={10} data={this.state.mapData} csvData={csvData} selectedFilters={this.state.selectedFilters} selectedVariable={this.state.selectedVariable} selectedValue={this.state.selectedValue}
            isFilterTabSelected={this.state.isFilterTabSelected} /*selectedYear={this.state.selectedYear}*/ selectedDate={this.state.selectedDate} isStaticData={this.state.isStaticData}></Map>
          }
          {/* {
            this.state.selectedCounty == null & this.state.selectedPattern == null
            ? null
            : <input className="clear" type="button" value="Reset Selections" onClick={this.resetSelections.bind(this)} />
          } */}
          {this.renderLegend()}
        </div>
        <div className="content-left" /*style={this.state.filterBox}*/>  
          {/* {this.renderTimeSlider()} */}
          {!this.state.isStaticData && (
            <TimeSlider
              timeRange={this.state.timeRange}
              selectedDate={this.state.selectedDate}
              onDateChange={this.handleDateChange}
            />
          )}

          <LawsInfo width={this.state.filterBox.width-10} height={this.state.filterBox.height-30} padding={10} parsedData={parsedData} csvData={csvData} fipsData={this.state.fipsData} selectedDate={this.state.selectedDate} onVariableSelect={this.handleVariableSelect} onTabChange={this.handleTabChange}></LawsInfo>
        </div>
      </div>
    );
  }
}

export default  withRouter(GeoMap)