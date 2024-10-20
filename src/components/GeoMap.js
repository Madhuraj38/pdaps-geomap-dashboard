import React from 'react';
import * as d3 from "d3";
import '../App.css';
import Map from "./Map"
import MapLegend from './MapLegend';

export default class GeoMap extends React.Component {

  state={              
    mapBox: { width: 100, height: 100, top: 0, left: 0},
    // countyBox: { width: 100, height: 100, top: 0, left: 0},
    // patternInfoBox: { width: 100, height: 100, top: 0, left: 0},
    // patternBox: { width: 100, height: 100, top: 0, left: 0}, 
    showInfo: false,
    infoText: null,
    mapData: null,
    selectedCounty: null,
    selectedCountyDetails: null,
    scaleFactor: 1 
  }

  componentDidMount() {
    var headerH = 50;
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight - headerH;
    var pad = 8;
    var scaleInfo = 1;
    if( window.innerHeight < 650) {
      scaleInfo = 0.75;
    }
    

    this.setState({            
                    mapBox:
                      { 
                        width: 0.55*(winWidth - pad*3), 
                        height: 0.75*(winHeight-3*pad), 
                        top: pad + headerH, 
                        left: pad
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
                    headerBox:
                    { 
                      width: winWidth, 
                      height: headerH, 
                      top: 0, 
                      left: 0
                    },               
                  mapBox:
                    { 
                      width: 0.55*(winWidth - pad*3), 
                      height: 0.75*(winHeight-3*pad), 
                      top: pad + headerH, 
                      left: pad
                    },
                  countyBox:
                    { 
                      width: 0.45*(winWidth - pad*3), 
                      height:  0.6*(0.75*(winHeight-3*pad) - pad), 
                      top: pad + headerH, 
                      left: 0.55*(winWidth - pad*3) + 2*pad
                    },
                  patternInfoBox:
                    { 
                      width: 0.45*(winWidth - pad*3), 
                      height: 0.4*(0.75*(winHeight-3*pad) - pad), 
                      top: 0.6*(0.75*(winHeight-3*pad) - pad) + 2*pad + headerH,
                      left: 0.55*(winWidth - pad*3) + 2*pad
                    },
                  patternBox:
                    { 
                      width: winWidth - 2*pad, 
                      height: 0.25*(winHeight - 3*pad), 
                      top: 0.75*(winHeight-3*pad) + 2*pad + headerH, 
                      left: pad
                    },
                  infoBox:
                    { 
                      width: winWidth < 460 ? winWidth : 460, 
                      maxHeight: winHeight / 2, 
                      top: winHeight < 350 ? pad : winHeight/2 - 175, 
                      left: winWidth < 460 ? pad : winWidth/2 - 230,
                      background: "white",
                      paddingBottom: 30
                    },
                    scaleFactor: scaleInfo,
                  });
  }
  
  loadData() {
    console.log("inside load");
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
      </div>
      // <div>
      //     <h1>GeoMap is still in develpment</h1>
      // </div>
    );
  }
}

