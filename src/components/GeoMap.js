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
    
    const parsedData = this.props.location?.state?.parsedData;

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

    if (parsedData) {
      console.log("Parsed Data in GeoMap.js:", parsedData); // Debugging log
    }

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

  render(){ 
    const parsedData = this.props.location?.state?.parsedData;
    console.log("Parsed Data in GeoMap render:", parsedData); 
    return (
      <div>
        <div className="contentdiv" style={this.state.mapBox}>
            <label class="contendDivHead">Map</label>          
            {/* <MapLegend width={200} height={35}></MapLegend> */}
            {
              
              this.state.mapData == null
              ? null
              : <Map width={this.state.mapBox.width-10} height={this.state.mapBox.height-50} padding={10} data={this.state.mapData} ></Map>
            }
            {/* {
              this.state.selectedCounty == null & this.state.selectedPattern == null
              ? null
              : <input className="clear" type="button" value="Reset Selections" onClick={this.resetSelections.bind(this)} />
            } */}
          </div>
          <div className="contentdiv" style={this.state.filterBox}>
            <label class="contendDivHead" >Filter Laws</label>          
            <LawsInfo width={this.state.filterBox.width-10} height={this.state.filterBox.height-30} padding={10} parsedData={parsedData}></LawsInfo>
        </div>
      </div>
    );
  }
}

export default  withRouter(GeoMap)