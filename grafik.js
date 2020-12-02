// The svg
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
.center([15, 51.2])                // GPS of location to zoom on
.scale(2500)                       // This is like the zoom
.translate([width / 2, height / 2]);

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
    .on("mouseover", mouseOver )
    .on("mouseleave", mouseLeave )
});


let mouseOver = function (d) {
    d3.selectAll(".GEN")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
}

let mouseLeave = function (d) {
    d3.selectAll(".GEN")
        .transition()
        .duration(200)
        .style("opacity", .8)
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
}