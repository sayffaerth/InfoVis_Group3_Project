//Load the SVG element that shall contain the visualisation
var svg = d3.select("#visGer"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var mapParentSVG =d3.select("#mapParentSVG");

//Variable with Getter and Setter that notify an dateUpdated() function when changed, so the map can be adjusted
var currentDate = {
    value: "",
    get val() {
        return this.value;
    },
    set val(value) {
        this.value = value;
        dateUpdated();
    }
}

currentDate.val = "01/01/2020"
// %%%%%%%%%%%%%%%%%%%%
// % Map & projection %
// %%%%%%%%%%%%%%%%%%%%

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(2400)        // This is like the zoom
    .center([11,51.2])  // GPS of location to zoom on
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

//Adding the color legend for the map
var legendFullHeight = height*0.6;
var legendFullWidth = 50;
var legendMargin = { top: 20, bottom: 20, left: 5, right: 30 };

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
    .domain([0, 200])
    .range([legendHeight, 0]);

var legendAxis = d3.axisRight(yRange)
    .tickValues(d3.range(0, 201, 20));


legendSvg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", "translate(" + legendWidth + ", 0)")
    .call(legendAxis);

mapParentSVG.append("text")
    .attr("x", 4)
    .attr("y", -5)
    .attr("dy", legendFullHeight)
    .style("fill","whiteSmoke")
    .style("font-size", "9px")
    .text("Inzidenzwert")
    .attr("font-family", "arial");

// %%%%%%%%%%%%%%%%%%%%
// % Tooltip          %
// %%%%%%%%%%%%%%%%%%%%


// HTML Version of the Tooltip
var htmlTooltip = d3.select("#mapSVG")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#262626")
    .style("color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");


// %%%%%%%%%%%%%%%%%%%%
// % Helper functions %
// %%%%%%%%%%%%%%%%%%%%
//helper variable to check if the day of the date actually changed.
var tempDate;
//Gets called whenever the var currentDate.val gets changed
function dateUpdated(){
    if(currentDate.val == tempDate){
        //The day of the date hasn't actually changed so we can return now.
        return;
    }
    tempDate = currentDate.val;

    //---------- Insert functionality below ----------//
    console.log("The date "+currentDate.val+" has been selected.");

    
}

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
        .style("left",document.getElementById("dataWrapper").getBoundingClientRect().x + (d3.mouse(this)[0]) + 20 + "px")
        .style("top", document.getElementById("dataWrapper").getBoundingClientRect().y + (d3.mouse(this)[1]) - 80 + "px")
};

var mouseleave = function (d) {
    htmlTooltip
        .style("opacity", 0);
    d3.select(this)
        .style("stroke", "white")
};

const valueMap = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
