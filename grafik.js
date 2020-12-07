// The svg
var svg = d3.select("#my_dataviz");
width = +svg.attr("width");
height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .center([15, 51.2])                // GPS of location to zoom on
    .scale(2000)                       // This is like the zoom
    .translate([width / 2, height / 2]);


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

// Load external data and boot
d3.json("./Data/bundeslaender_simplify200.geojson", function (data) {

// Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("fill", "#b50000")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave)
});


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
        .style("opacity", 0.8);
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
        .style("opacity", 1);
};