//Load the SVG element that shall contain the visualisation
var svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// %%%%%%%%%%%%%%%%%%%%
// % Map & projection %
// %%%%%%%%%%%%%%%%%%%%

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(2000)        // This is like the zoom
    .center([15,51.2])  // GPS of location to zoom on
    .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([0, 1, 2, 3, 4, 5])
    .range(d3.schemeBlues[7]);

// Fetch JSON Data and use it in visualisation as soon as it's done loading
d3.queue()
    .defer(d3.json, "https://opendata.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0.geojson")
    .await(dataLoaded);

// Call this as soon as the data is loaded to use it in the visualisation
function dataLoaded(error, topo) {
    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        })
        .style("stroke", "#fff")
        .on("mouseover", mouseOver )
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave );
}
// %%%%%%%%%%%%%%%%%%%%
// % Tooltip          %
// %%%%%%%%%%%%%%%%%%%%


var tooltip = d3.select("#my_dataviz").append("g")
    .attr("class", "tooltip")
    .style("opacity", 0);

tooltip.append("g:rect")
    .attr("width", 100)
    .attr("height", 20)
    .style("fill", "white")
    .style("stroke", "black")
    .style("opacity", 1);

tooltip.append("g:text")
    .attr("x", 40)
    .attr("y", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

// %%%%%%%%%%%%%%%%%%%%
// % Helper functions %
// %%%%%%%%%%%%%%%%%%%%

let mouseOver = function (d) {
    tooltip
        .style("opacity", 1);
    d3.selectAll(".GEN")
        .transition()
        .duration(200)
        .style("opacity", .5);
    tooltip
        .style("opacity", 1);
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0.8)
        .style("stroke", "steelblue")
        .style("stroke-opacity", 1)
};

let mouseMove = function (d) {
    var xPosition = d3.mouse(this)[0] + 10;
    var yPosition = d3.mouse(this)[1] - 5;
    tooltip.style("display", "inline")
        .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
        .select("text").text("My tooltip")
        .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
        tooltip.raise();
};

let mouseLeave = function (d) {
    tooltip
        .style("opacity", 0);
    d3.selectAll(".GEN")
        .transition()
        .duration(200)
        .style("opacity", .8);
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "white")
        .style("stroke-opacity", 0.2)

};