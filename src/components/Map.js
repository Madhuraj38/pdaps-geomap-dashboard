import React from 'react';
import * as d3 from "d3";
import { geoPath } from "d3-geo"
import { feature } from "topojson-client"
import {schemeBlues} from "d3-scale-chromatic"

const projection = null

const stateToFIPS = {
  "Alabama": "01",
  "Alaska": "02",
  "Arizona": "04",
  "Arkansas": "05",
  "California": "06",
  "Colorado": "08",
  "Connecticut": "09",
  "Delaware": "10",
  "Florida": "12",
  "Georgia": "13",
  "Hawaii": "15",
  "Idaho": "16",
  "Illinois": "17",
  "Indiana": "18",
  "Iowa": "19",
  "Kansas": "20",
  "Kentucky": "21",
  "Louisiana": "22",
  "Maine": "23",
  "Maryland": "24",
  "Massachusetts": "25",
  "Michigan": "26",
  "Minnesota": "27",
  "Mississippi": "28",
  "Missouri": "29",
  "Montana": "30",
  "Nebraska": "31",
  "Nevada": "32",
  "New Hampshire": "33",
  "New Jersey": "34",
  "New Mexico": "35",
  "New York": "36",
  "North Carolina": "37",
  "North Dakota": "38",
  "Ohio": "39",
  "Oklahoma": "40",
  "Oregon": "41",
  "Pennsylvania": "42",
  "Rhode Island": "44",
  "South Carolina": "45",
  "South Dakota": "46",
  "Tennessee": "47",
  "Texas": "48",
  "Utah": "49",
  "Vermont": "50",
  "Virginia": "51",
  "Washington": "53",
  "West Virginia": "54",
  "Wisconsin": "55",
  "Wyoming": "56",
  "District of Columbia": "11",
  "American Samoa": "60",
  "Guam": "66",
  "Northern Mariana Islands": "69",
  "Puerto Rico": "72",
  "Virgin Islands": "78"
};

function getStateValueAtDate(stateEntries, stateName, selectedDate) {
  const date = new Date(selectedDate);

  const entries = stateEntries
    .filter(entry => entry.state === stateName)
    .map(entry => ({
      ...entry,
      effective: new Date(entry.effective_date),
      validThrough: new Date(entry.valid_through_date)
    }));

  // Find the entry active on selected date
  const activeEntry = entries.find(entry =>
    date >= entry.effective && date <= entry.validThrough
  );

  return activeEntry ? activeEntry.value : null;
}


const renderCounty = (csvData, selectedVariable, selectedValue, selectedFilters, isFilterTabSelected, selectedDate, isStaticData) => {    
  return (d, index) => {
    // Start with default fill color (for questions tab)
    const pathProps = {
      key: `path-${ index }`,
      d: d.path, 
      fill: "#5bc0de",           
      stroke: "#ffffff",
      strokeWidth: 0.5, 
      cursor: "pointer"
    };

    if (csvData) {
      const stateFIPS = d.id.substring(0, 2);
      const stateName = Object.keys(stateToFIPS).find(key => stateToFIPS[key] === stateFIPS);
      if (stateName) {
        if (isFilterTabSelected) {
          // FILTERS MODE: Use stacked filter logic.
          if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
            // No filters selected – use a “meets criteria” color.
            pathProps.fill = '#8BC34A';
          } else {
            let meetsAll = true;
            Object.entries(selectedFilters).forEach(([variableKey, filter]) => {
              const selectedVal = filter.code; // numeric code
              const variableData = csvData.variables[variableKey];
              if (variableData) {
                let stateValue = null;

                if (isStaticData) {
                  // Just pick the latest entry
                  const matchingStates = variableData.states
                    .filter(entry => entry.state === stateName);
                  if (matchingStates.length > 0) {
                    stateValue = matchingStates[matchingStates.length - 1].value;
                  }
                } else {
                  // Use time-filtered logic
                  stateValue = getStateValueAtDate(variableData.states, stateName, selectedDate);
                }

                if (stateValue == null || stateValue != selectedVal) {
                  meetsAll = false;
                }
                // if (!stateData || stateData.value != selectedVal) {
                //   meetsAll = false;
                // }
              } else {
                meetsAll = false;
              }
            });
            pathProps.fill = meetsAll ? '#8BC34A' : '#d3d3d3';
          }
        } else {
          // QUESTIONS MODE: Use the single selected variable.
          if (selectedVariable) {
            const variableData = csvData.variables[selectedVariable];
            if (variableData) {
              // const stateData = variableData.states.find(state => state.state === stateName);
              let stateValue = null;

              if (isStaticData) {
                // Just pick the latest entry
                const matchingStates = variableData.states
                  .filter(entry => entry.state === stateName);
                if (matchingStates.length > 0) {
                  stateValue = matchingStates[matchingStates.length - 1].value;
                }
              } else {
                // Use time-filtered logic
                stateValue = getStateValueAtDate(variableData.states, stateName, selectedDate);
              }

              // if (stateData) {
                // Color mapping based on stateData.value.
                if (stateValue === 1) {
                  pathProps.fill = "#2491C1";
                } else if (stateValue === 0) {
                  pathProps.fill = "#ECCB7B";
                } else {
                  // If no match, use default fill.
                  pathProps.fill = "#d3d3d3";
                }
              // }
            }
          }
          // If no variable is selected in questions mode, remain at default "#5bc0de".
        }
      }
    }
    
    return <path {...pathProps} />;
  };
};



const renderState = () => {    
  return (d, index) => {
    
    const pathProps = {
      key: `st-path-${ index }`,
      d: d.path,      
      fill: "none",
      stroke: "#ffffff",//"#cecece",
      strokeWidth: 2, 
    }      
    return <path {...pathProps} ></path>
  };
};

export default class Map extends React.Component {
  svgRef = React.createRef();
  state = {
    transform: `translate(${0}, ${0}) scale(${1})`,
    height:200,
    width: 300,
    scale: 1,
    countyPaths: [],
    statePaths: [],
    selectedCounty: null,
  }

  componentDidMount() {
    var wd = this.props.width
    var ht = this.props.height
    this.zoom = d3
      .zoom()
      .scaleExtent([0.8, 7])
      .translateExtent([
        [-100, -100],
        [wd + 100, ht + 100],
      ])
      .extent([
        [-100, -100],
        [wd + 100, ht + 100],
      ])
      .on("zoom", this.zoomed.bind(this));
    d3.select(this.svgRef.current).call(this.zoom);

    var ft = feature(this.props.data, this.props.data.objects.counties).features
    var countyPaths = ft.map( (d, index) => { return { id: d.id, path: geoPath().projection(projection)(d)} })

    var ft2 = feature(this.props.data, this.props.data.objects.states).features
    var statePaths = ft2.map( (d, index) => { return { id: d.id, path: geoPath().projection(projection)(d)} })

    var w = this.props.width
    var h = this.props.height 
    var l = 0
    var s = w / 1000 > h / 585 ? h / 585 : w / 1000;
    
    this.setState({countyPaths: countyPaths, statePaths: statePaths, transform: `translate(${l}, ${0}) scale(${s})`, scale: s, height:h, width: w})
  }
  
  static getDerivedStateFromProps(props, state){
    if(state.width != props.width || state.height != props.height) {
      var w = props.width
      var h = props.height 
      var l = 0
      var s = w / 1000 > h / 586 ? h / 586 : w / 1000;
      
      return({transform: `translate(${l}, ${0}) scale(${s})`, scale: s, height:h, width: w})
    }
    if(props.selectedCounty == null){
      return({selectedCounty: null});
    }
    return null
  }

  zoomed(event) {
    var zoomTransform = event.transform
    var x = 0
    var y = 0
    var transform = `translate(${x + zoomTransform.x}, ${y + zoomTransform.y}) scale(${this.state.scale*zoomTransform.k})`;
    this.setState({transform: transform})   
  }

  onSelect(item, details) {
    this.props.onSelect(+item.id, details);
    this.setState({selectedCounty: item.path})
  }

  render() {
      
    var colorScale = d3.scaleThreshold().domain(d3.range(0, 160, 20)).range(schemeBlues[9]);
    
    return (
        <svg width={this.props.width} height={this.props.height} style={{margin:5}} ref="svg"  >
          <g className="country"></g>
          
          <g className="counties" transform={this.state.transform}>
            {this.state.countyPaths.map(renderCounty(this.props.csvData, this.props.selectedVariable, this.props.selectedValue, this.props.selectedFilters, this.props.isFilterTabSelected, this.props.selectedDate, this.props.isStaticData))}
          </g>
          <g className="states" transform={this.state.transform}>
            {this.state.statePaths.map(renderState())}
            <path d={this.state.selectedCounty} fill={"none"} stroke={"#eb9514"} strokeWidth={1.5} ></path>
          </g>
        </svg>
    );
  }
}
