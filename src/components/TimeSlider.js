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

    // Background Track with Gradient (Past vs Future)
    const trackGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "trackGradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    trackGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6");

    trackGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#8b5cf6");

    trackGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ec4899");

    // Main track line
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", 28)
      .attr("width", width - margin.left - margin.right)
      .attr("height", 4)
      .attr("fill", "url(#trackGradient)")
      .attr("rx", 2)
      .attr("ry", 2);

    // X-axis: Show only major years (every 5 years)
    const totalYears = endDate.getFullYear() - startDate.getFullYear();
    const tickStep = Math.max(1, Math.floor(totalYears / 6)); // Aim for 5–7 ticks
    
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(tickStep))
      .tickFormat(d3.timeFormat("%Y"))
      .tickSize(0)
      .tickPadding(8);
    

    svg.append("g")
      .attr("transform", `translate(0,30)`)
      .call(xAxis)
      .style("font-family", "'Segoe UI', Tahoma, sans-serif")
      .style("font-weight", "bold")
      .style("font-size", "12px")
      .style("fill", "#1e40af");

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

        // Animate marker to new position
        marker.transition()
          .duration(150)
          .attr("x", newX - 15);

      });

    // Add Pill Marker Handle with Glow
    const marker = svg.append("rect")
      .attr("x", xScale(currentDate) - 15)
      .attr("y", 24)
      .attr("width", 30)
      .attr("height", 12)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "#ffffff")
      .attr("stroke", "#1e40af")
      .attr("stroke-width", 2)
      .style("cursor", "grab")
      .call(drag);

    // Add glow effect
    marker.append("animate")
      .attr("attributeName", "stroke-width")
      .attr("values", "2;3;2")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    // Add shadow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 2);
    
    filter.append("feOffset")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("result", "offsetblur");
    
    filter.append("feComponentTransfer")
      .append("feFuncA")
      .attr("type", "linear")
      .attr("slope", 0.3);
    
    filter.append("feMerge")
      .append("feMergeNode");
    filter.append("feMerge")
      .append("feMergeNode")
      .attr("in", "SourceGraphic");

    marker.attr("filter", "url(#shadow)");

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

        // Animate pill marker to clicked position
        marker.transition()
          .duration(200)
          .attr("x", xScale(newDate) - 15);

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
