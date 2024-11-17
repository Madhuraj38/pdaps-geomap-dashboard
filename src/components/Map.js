import React from 'react';
import * as d3 from "d3";
import { geoPath } from "d3-geo"
import { feature } from "topojson-client"
import {schemeBlues} from "d3-scale-chromatic"

const projection = null

const renderCounty = () => {    
  return (d, index) => {
    
    // var no_death = deaths[+d.id].val 
    const pathProps = {
      key: `path-${ index }`,
      d: d.path, 
      fill: "#5bc0de",           
      stroke: "#ffffff",
      strokeWidth: 0.5, 
      cursor: "pointer"
    } 

    // if(patternStates.length > 0) {
    //   pathProps.fill = "#f1f1f1"      
    //   if(patternStates.includes(+d.id)){
    //      pathProps.fill =  colorScale(+no_death)        
    //   }
    // }
    // else{
    //   pathProps.fill =  colorScale(+no_death)
    // }
    /*onClick={() => onSelect(d, deaths[+d.id])}><title>{"County: " + deaths[+d.id].county + "\nState: " + deaths[+d.id].state + "\nDeaths: " + no_death + " per 100K"}</title>*/
    return <path {...pathProps} ></path>
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
            {this.state.countyPaths.map(renderCounty())}
          </g>
          <g className="states" transform={this.state.transform}>
            {this.state.statePaths.map(renderState())}
            <path d={this.state.selectedCounty} fill={"none"} stroke={"#eb9514"} strokeWidth={1.5} ></path>
          </g>
        </svg>
    );
  }
}
