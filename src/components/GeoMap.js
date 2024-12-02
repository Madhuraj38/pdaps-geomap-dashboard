import React from 'react';
import * as d3 from "d3";
import '../App.css';
import Map from "./Map"
import { withRouter } from './withRouter';
import MapLegend from './MapLegend';
import LawsInfo from './LawsInfo';

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
    scaleFactor: 1,
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

  handleVariableSelect = (variableName) => {
    // Update the selected variable name in state
    this.setState({ selectedVariable: variableName });
  };

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
            : <Map width={this.state.mapBox.width-10} height={this.state.mapBox.height-50} padding={10} data={this.state.mapData} csvData={csvData} selectedVariable={this.state.selectedVariable} ></Map>
          }
          {/* {
            this.state.selectedCounty == null & this.state.selectedPattern == null
            ? null
            : <input className="clear" type="button" value="Reset Selections" onClick={this.resetSelections.bind(this)} />
          } */}
          {/* <div className='legend'>
            <ul className="legend-label">
              <li className="key" style={{borderLeftColor:'#5e8037', color:'black'}}>Meets Criteria</li>
              <li className="key" style={{borderLeftColor:'#d3d3d3', color:'black'}}>Not match</li>
            </ul>
          </div> */}
        </div>
        <div className="content-left" /*style={this.state.filterBox}*/>      
          <LawsInfo width={this.state.filterBox.width-10} height={this.state.filterBox.height-30} padding={10} parsedData={parsedData} onVariableSelect={this.handleVariableSelect}></LawsInfo>
        </div>
      </div>
    );
  }
}

export default  withRouter(GeoMap)