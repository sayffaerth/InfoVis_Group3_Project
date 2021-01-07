//Load the SVG element that shall contain the visualisation
var svg = d3.select("#map_viz"),
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

// Fetch JSON Data and use it in visualisation as soon as it's done loading
var data = d3.map();
d3.queue()
    .defer(d3.json, "https://opendata.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0.geojson")
    .await(dataLoaded);
//For additional details about the datasets used please refer to the Github Project Wiki - Datensätze (german)

// Call this as soon as the data is loaded to use it in the visualisation
function dataLoaded(error, topo) {
    // Draw the map
    svg.append("g")
        .classed("map",true)
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // basecolor = 50% gray to see the countries even when no data is available
        .attr("fill", "#808080")
        .style("stroke", "#fff")
        .on("mouseover", mouseOver )
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave );

    assignIDs();
    updateMapFillData();
}

//Fügt den einzelnen Ländern ihre Namen als class als Identifier hinzu
//Aktuell hardgecodet für RKI Tagesstand
function assignIDs(){
    d3.select(".map").selectAll("path").each(function () {
        var u = d3.select(this)
        u.classed(u.data()[0].properties.LAN_ew_GEN,true);
    })
}


function updateMapFillData(){
    d3.select(".map").selectAll("path").attr("fill",(function (){
        var inzidenz = d3.select(this).data()[0].properties.cases7_bl_per_100k;
        return d3.interpolateReds(valueMap(inzidenz,0,200,0,1));
    }));
}

//Adding the color legend for the map
var legendFullHeight = height;
var legendFullWidth = 70;
var legendMargin = { top: 20, bottom: 20, left: 5, right: 40 };

//margined measurements
var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;
var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;

var legendSvg = d3.select('#legend-svg')
    .attr('width', legendFullWidth)
    .attr('height', legendFullHeight)
    .append('g')
    .attr('transform', 'translate(' + legendMargin.left + ',' +
        legendMargin.top + ')');

var legend = legendSvg.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateReds(0))
    .attr("stop-opacity", 1);

legend.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", d3.interpolateReds(0.25))
    .attr("stop-opacity", 1);

legend.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", d3.interpolateReds(0.5))
    .attr("stop-opacity", 1);

legend.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", d3.interpolateReds(0.75))
    .attr("stop-opacity", 1);

legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateReds(1))
    .attr("stop-opacity", 1);

legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

var yRange = d3.scaleLinear()
    .domain([0, 20])
    .range([legendHeight, 0]);

var legendAxis = d3.axisRight(yRange)
    .tickValues(d3.range(0, 21));

legendSvg.append("g")
    .attr("class", "legend axis")
    .attr("transform", "translate(" + legendWidth + ", 0)")
    .call(legendAxis);


// %%%%%%%%%%%%%%%%%%%%
// % Tooltip          %
// %%%%%%%%%%%%%%%%%%%%


var tooltip = d3.select("#map_viz").append("g")
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

const valueMap = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;