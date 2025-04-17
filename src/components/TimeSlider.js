import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TimeSlider = ({ timeRange, selectedDate, onDateChange }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!timeRange || timeRange.length !== 2) return;

    // Convert integer years to Date objects for the scale
    const startDate = new Date(timeRange[0], 0, 1); // Jan 1st of start year
    const endDate = new Date(timeRange[1], 11, 31); // Dec 31st of end year

    const width = 400;
    const height = 50;
    const margin = { left: 20, right: 20 };

    // Ensure selectedDate is a valid Date
    let currentDate = selectedDate instanceof Date ? selectedDate : new Date(timeRange[0], 0, 1);
    if (isNaN(currentDate.getTime())) {
      currentDate = new Date(timeRange[0], 0, 1);
      onDateChange(currentDate);
    }

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Scale: Convert year range to pixel values
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([margin.left, width - margin.right]);

    // Background: Two Color Sections (Yellow & Blue)
    // svg.append("rect")
    //   .attr("x", margin.left)
    //   .attr("y", 10)
    //   .attr("width", xScale(currentDate) - margin.left)
    //   .attr("height", 20)
    //   .attr("fill", "#d4af37");

    // svg.append("rect")
    //   .attr("x", xScale(currentDate))
    //   .attr("y", 10)
    //   .attr("width", width - xScale(currentDate) - margin.right)
    //   .attr("height", 20)
    //   .attr("fill", "#4682B4");

    // X-axis: Show only major years (every 5 years)
    const totalYears = endDate.getFullYear() - startDate.getFullYear();
    const tickStep = Math.max(1, Math.floor(totalYears / 6)); // Aim for 5–7 ticks
    
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(tickStep))
      .tickFormat(d3.timeFormat("%Y"));
    

    svg.append("g")
      .attr("transform", `translate(0,30)`)
      .call(xAxis);

    // Draggable Marker for Selecting Date
    const drag = d3.drag()
      .on("drag", (event) => {
        let newX = event.x;
        newX = Math.max(margin.left, Math.min(width - margin.right, newX));

        // Convert pixel value to full date
        let newDate = xScale.invert(newX);
        if (!isNaN(newDate.getTime())) {
          onDateChange(newDate);
        }

      });

    // Add Marker Line
    const marker = svg.append("line")
      .attr("x1", xScale(currentDate))
      .attr("x2", xScale(currentDate))
      .attr("y1", 5)
      .attr("y2", 35)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .call(drag);

    // Display Selected Date (YYYY-MM-DD)
    // const dateLabel = svg.append("text")
    //   .attr("x", xScale(currentDate))
    //   .attr("y", 45)
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "14px")
    //   .attr("font-weight", "bold")
    //   .text(d3.timeFormat("%Y-%m-%d")(currentDate));

    svg.on("click", (event) => {
      const [clickX] = d3.pointer(event);
      let newDate = xScale.invert(clickX);

      if (!isNaN(newDate.getTime())) {
        onDateChange(newDate);

        // Move marker to clicked position
        marker.attr("x1", xScale(newDate)).attr("x2", xScale(newDate));

        // Update date label
        // dateLabel
        //   .attr("x", xScale(newDate))
        //   .text(d3.timeFormat("%Y-%m-%d")(newDate));
      }
    });

  }, [timeRange, selectedDate, onDateChange]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div className="selected-date" style={{ textAlign: "center" }}>
        <span>Selected Date: {d3.timeFormat("%Y-%m-%d")(selectedDate)}</span>
      </div>
    </div>
  );
};

export default TimeSlider;
