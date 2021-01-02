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
    .center([15, 51.2])  // GPS of location to zoom on
    .translate([width / 2, height / 2]);

// Fetch JSON Data and use it in visualisation as soon as it's done loading
var data = d3.map();
d3.queue()
    .defer(d3.json, "https://opendata.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0.geojson")
    .defer(d3.csv, "./Data/ZPID lockdown measures dataset 3.0.csv")
    .await(function (error, topo, rules) {
        if (error) {
            console.log('Error when loading .csv files in grafik.js');
        } else {
            dataLoaded(topo);
            doSomethingWithTheCovidMeasuresAndRules(rules);
        }
    });
//For additional details about the datasets used please refer to the Github Project Wiki - Datensätze (german)

// Call this as soon as the data is loaded to use it in the visualisation
function dataLoaded(topo) {
    // Draw the map
    svg.append("g")
        .classed("map", true)
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
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    assignIDs();
    updateMapFillData();

}


//Fügt den einzelnen Ländern ihre Namen als class als Identifier hinzu
//Aktuell hardgecodet für RKI Tagesstand
function assignIDs() {
    d3.select(".map").selectAll("path").each(function () {
        var u = d3.select(this);
        u.classed(u.data()[0].properties.LAN_ew_GEN, true);
    })
}


function updateMapFillData() {
    d3.select(".map").selectAll("path").attr("fill", (function () {
        var inzidenz = d3.select(this).data()[0].properties.cases7_bl_per_100k;
        return d3.interpolateReds(valueMap(inzidenz, 0, 200, 0, 1));
    }));
}

// %%%%%%%%%%%%%%%%%%%%
// % Tooltip          %
// %%%%%%%%%%%%%%%%%%%%


// HTML Version of the Tooltip
var htmlTooltip = d3.select("#mapSVG")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");


// %%%%%%%%%%%%%%%%%%%%
// % Helper functions %
// %%%%%%%%%%%%%%%%%%%%
function doSomethingWithTheCovidMeasuresAndRules(d) {
    console.log(d)
}

var mouseover = function (d) {
    htmlTooltip
        .style("opacity", 1);
    d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
};

var mousemove = function (d) {
    let cases = d3.select(this).data()[0].properties.cases7_bl_per_100k;
    cases = Math.round(cases);
    let land = d3.select(this).data()[0].properties.LAN_ew_GEN;
    htmlTooltip
        .html(land + "<br> Inzidenzwert: " + cases)
        .style("left",document.getElementById("map_viz").getBoundingClientRect().x + (d3.mouse(this)[0]) + 20 + "px")
        .style("top", document.getElementById("map_viz").getBoundingClientRect().y + (d3.mouse(this)[1])  + "px")
};

var mouseleave = function (d) {
    htmlTooltip
        .style("opacity", 0);
    d3.select(this)
        .style("stroke", "white")
};

const valueMap = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
