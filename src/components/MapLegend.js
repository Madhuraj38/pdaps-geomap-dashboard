import React from 'react';
import * as d3 from "d3";
import {schemeBlues} from "d3-scale-chromatic"

const renderSegment = (colorScale,dw, top) => {    
    return (d, index) => {
      
      
      if(index == 0){
        return <g key={`g-${index}`} transform={ `translate(${ index*dw }, ${ top })`}>                    
                    <line stroke="#000000" x1={dw} x2={dw} y1={0} y2={12}></line>
                    <text x={dw}  y={20} textAnchor="middle" fontSize={8}>{d}</text>
                </g>

      }
      return <g key={`g-${index}`} transform={ `translate(${ index*dw }, ${ top })`}>
                <rect x={1} y={0} height={8} width={dw-1} fill={colorScale(index)}></rect>
                <line stroke="#000000" x1={dw} x2={dw} y1={0} y2={12}></line>
                <text x={dw}  y={20} textAnchor="middle" fontSize={8}>{d}</text>
            </g>
    };
  };

export default class MapLegend extends React.Component {

  render() {    
    var colorScale = d3.scaleThreshold().domain(d3.range(0, 8, 1)).range(schemeBlues[9]);
    var items = [0, 20,40,60,80,100,120,140,160]
    var dw = (this.props.width - 20) / items.length
    return (        
        <svg height={this.props.height} width={this.props.width} style={{right:30, top:10, position:"absolute", background:"#ffffff"}}>
            <text x={dw}  y={8} textAnchor="start" fontSize={9}>{"Deaths per 100K"}</text>
            {items.map(renderSegment(colorScale, dw, 10))}
            {/*<g class="key" transform="translate(0,30)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle">
                <rect height="8" x="700" width="0" fill="#deebf7"></rect>
                <rect height="8" x="700" width="29" fill="#deebf7"></rect>
                <rect height="8" x="729" width="29" fill="#c6dbef"></rect>
                <rect height="8" x="758" width="29" fill="#9ecae1"></rect>
                <rect height="8" x="787" width="29" fill="#6baed6"></rect>
                <rect height="8" x="816" width="28" fill="#4292c6"></rect>
                <rect height="8" x="844" width="29" fill="#2171b5"></rect>
                <rect height="8" x="873" width="29" fill="#08519c"></rect>
                <rect height="8" x="902" width="29" fill="#08306b"></rect>
                <text class="caption" x="700" y="-6" fill="#000" text-anchor="start" font-weight="bold">COVID Deaths per 100K</text>
                    <g class="tick" opacity="1" transform="translate(700.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">0</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(729.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">20</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(758.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">40</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(787.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">60</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(816.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">80</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(844.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">100</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(873.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">120</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(902.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">140</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(931.5,0)">
                        <line stroke="currentColor" y2="13"></line>
                        <text fill="currentColor" y="16" dy="0.71em">160</text>
                    </g>
                </g>         */}   
            </svg>
    );
  }
}