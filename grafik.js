//Load the SVG element that shall contain the visualisation
var svg = d3.select("#visGer"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var mapParentSVG = d3.select("#mapParentSVG");

//Variable with Getter and Setter that notify an dateUpdated() function when changed, so the map can be adjusted
var currentDate = {
    value: "01/01/2020",
    value2: "2020-01-01",
    get val() {
        return this.value;
    },
    set val(value) {
        this.value = value;
    },
    get val2() {
        return this.value2;
    },
    set val2(value) {
        this.value2 = value;
        //Muss hier sein (oder in beiden Settern) sonst unerwünschtes Verhalten beim rum klicken in dem Fallzahlengraph
        dateUpdated();
    }
}

// %%%%%%%%%%%%%%%%%%%%
// % Map & projection %
// %%%%%%%%%%%%%%%%%%%%

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(2400)        // This is like the zoom
    .center([11, 51.2])  // GPS of location to zoom on
    .translate([width / 2, height / 2]);
var caseData;

// Fetch JSON Data and use it in visualisation as soon as it's done loading
var data = d3.map();
d3.queue()
    .defer(d3.json, "https://opendata.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0.geojson")
    .defer(d3.json, "./Data/rki2020data-parsed.json")
    .defer(d3.csv, "./Data/ZPID lockdown measures dataset 3.0.csv")
    .await(function (error, topo, cases, rules) {
        if (error) {
            console.log('Error when loading .csv files in grafik.js');
        } else {
            caseData = cases;
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
        .style("stroke", "black")
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
    /* Previous approach: Using the current RKI data
    d3.select(".map").selectAll("path").attr("fill", (function () {
        var inzidenz = d3.select(this).data()[0].properties.cases7_bl_per_100k;
        return d3.interpolateReds(valueMap(inzidenz, 0, 200, 0, 1));
    })); */

    /* New apporach: Using parsed 2020 case data */
    var dataIndexForDate = 0;
    for(i = 0; i < caseData.length; i++){
        if(caseData[i].Meldedatum == currentDate.val){
            dataIndexForDate = i;
            //console.log("Index for date is "+i);
            break;
        }
    }

    d3.select(".map").selectAll("path").attr("fill", (function () {
        var state2update = d3.select(this).data()[0].properties.LAN_ew_GEN;
        var date2update = currentDate.val;
        //console.log("Please update "+state2update+" to "+date2update);

        var dataIndexForState = 0;
        for(i = 0; i < caseData[dataIndexForDate].casesByBL.length; i++){
            if(caseData[dataIndexForDate].casesByBL[i].Bundesland == state2update){
                dataIndexForState = i;
                //console.log("Index for state is "+i);
                break;
            }
        }
        var inzidenz = caseData[dataIndexForDate].casesByBL[dataIndexForState].cases.Inzidenz;
        //console.log("Inzidenz for "+state2update+" on "+currentDate.val+" is "+inzidenz);
        return d3.interpolateReds(valueMap(inzidenz, 0, 200, 0, 1));
    }));
}

//Adding the color legend for the map
var legendFullHeight = height * 0.6;
var legendFullWidth = 50;
var legendMargin = {top: 20, bottom: 20, left: 5, right: 30};

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
    .style("fill", "whiteSmoke")
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
    .attr("class", "MapTooltip")
    .style("text-align", "center")
    //TODO make tooltip unselectable
    // .style("-webkit-user-select", "none")
    // .style("-moz-user-select", "none")
    // .style("-khtml-user-select", "none")
    // .style("-ms-user-select", "none")
    // .style("user-select", "none")
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
function dateUpdated() {
    if (currentDate.val === tempDate) {
        //The day of the date hasn't actually changed so we can return now.
        return;
    }
    tempDate = currentDate.val;

    //---------- Insert functionality below ----------//
    updateMapFillData();

    d3.select(".map").selectAll("path").each(function () {
        loadCovidRulesIntoMap(CovidMeasuresAndRules, d3.select(this));
    })
    if (tooltipRequired)
        updateTooltipInfo();

    d3.select(".MapTooltip")
        .html(buildTooltipText());
}

var CovidMeasuresAndRules;

function doSomethingWithTheCovidMeasuresAndRules(d) {
    CovidMeasuresAndRules = d;
}

function loadCovidRulesIntoMap(d, selection) {
    let tmpLand;
    let date = currentDate.val2;
    // if(date vor dem 08. März 2020 ) then date = 08.März 2020
    for (let i = 0; i < 16; i++) {
        tmpLand = selection.data()[0].properties.LAN_ew_GEN;
        for (let j = 0; j < d.length; j++) {
            if (tmpLand === d[j].state) {
                selection.attr(d[j].Measure, d[j][date]);
            }
        }
    }
}

var tooltipRequired = false;
var selection;
var land;
var cases;

//Alle möglichen Maßnahmen

var rulesAndMeasures = {
    leavehome: "",
    dist: "",
    msk: "",
    shppng: "",
    hcut: "",
    ess_shps: "",
    zoo: "",
    demo: "",
    school: "",
    church: "",
    onefriend: "",
    morefriends: "",
    plygrnd: "",
    daycare: ""
}

function* iterate_object(o) {
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
        yield [keys[i], o[keys[i]]];
    }
}

function updateTooltipInfo() {
    cases = Math.round(selection.data()[0].properties.cases7_bl_per_100k);
    land = selection.data()[0].properties.LAN_ew_GEN;

    for (let [key, value] of iterate_object(rulesAndMeasures)) {
        rulesAndMeasures[key] = selection.attr("" + key);
    }

    // rulesAndMeasures.leavehome = selection.attr("leavehome");
    // rulesAndMeasures.dist = selection.attr("dist");
    // rulesAndMeasures.msk = selection.attr("msk");
    // rulesAndMeasures.shppng = selection.attr("shppng");
    // rulesAndMeasures.hcut = selection.attr("hcut");
    // rulesAndMeasures.ess_shps = selection.attr("ess_shps");
    // rulesAndMeasures.zoo = selection.attr("zoo");
    // rulesAndMeasures.demo = selection.attr("demo");
    // rulesAndMeasures.school = selection.attr("school");
    // rulesAndMeasures.church = selection.attr("church");
    // rulesAndMeasures.onefriend = selection.attr("onefriend");
    // rulesAndMeasures.morefriends = selection.attr("morefriends");
    // rulesAndMeasures.plygrnd = selection.attr("plygrnd");
    // rulesAndMeasures.daycare = selection.attr("daycare");
}

function buildTooltipText() {
    let string = land + " am " + currentDate.val + ": <br> Inzidenz: " + cases;
    if (!!rulesAndMeasures.msk) {
        for (let [key, value] of iterate_object(rulesAndMeasures)) {
            if (value !== "0") {
                let strenge = "";
                switch (key) {
                    case "leavehome":
                        if(rulesAndMeasures.leavehome === "1") {
                            strenge = "teilweise ";
                        }
                        else{
                            strenge = "strenge ";
                        }

                        string += (
                            '<br> <img src="./Pictures/Maßnahmen/Stayhome.png\" alt="Zuhause bleiben" width="20" height="20">' +
                            strenge + "Ausgangsbeschränkung: ");
                        break;
                    case "dist":
                        string += ("<br> Abstandsregel");
                        break;
                    case "msk":
                        if(rulesAndMeasures.msk === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            '<br> <img src="./Pictures/Maßnahmen/Masken.png\" alt="Maskenpflicht" width="20" height="20">' +
                            strenge + "Maskenpflicht"
                        );
                        break;
                    case "shppng":
                        if(rulesAndMeasures.shppng === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br> " + strenge + "Ladeneinschränkungen"
                        );
                        break;
                    case "hcut":
                        if(rulesAndMeasures.hcut === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Friseure geschlossen"
                        );
                        break;
                    case "ess_shps":
                        if(rulesAndMeasures.ess_shps === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Alles ausser Supermärkte zu"
                        );
                        break;
                    case "zoo":
                        if(rulesAndMeasures.zoo === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Zoos geschlossen"
                        );
                        break;

                    case "demo":
                        if(rulesAndMeasures.demo === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Demoverbot"
                        )
                        break;
                    case "school":
                        if(rulesAndMeasures.school === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            '<br> <img src="./Pictures/Maßnahmen/Schulen.png\" alt="Schulen geschlossen" width="20" height="20">'+
                            strenge + "Schulen geschlossen"
                        )
                        break;
                    case "church":
                        if(rulesAndMeasures.church === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Kirchen geschlossen"
                        )
                        break;
                    case "onefriend":
                        string += (
                            "<br> Treff mit einer oder mehr Personen verboten"
                        )
                        break;
                    case "morefriends":
                        if(rulesAndMeasures.morefriends === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Kontaktbeschränkung"
                        )
                        break;
                    case "plygrnd":
                        if(rulesAndMeasures.plygrnd === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            "<br>" + strenge + "Spielplatzsperrung"
                        )
                        break;
                    case "daycare":
                        if(rulesAndMeasures.daycare === "1") {
                            strenge = "teilweise ";
                        }
                        else {
                            strenge = "strenge ";
                        }
                        string += (
                            '<br> <img src="./Pictures/Maßnahmen/Daycare.png\" alt="Kinderbetreuung geschlossen" width="20" height="20">' +
                            strenge + "Kinderbetreuung geschlossen"
                        )
                        break;
                    default:
                        break;
                }
            }
        }
        return string;
    } else {
        return (
            land + " am " + currentDate.val +
            ": <br> Inzidenz: " + cases +
            "<br> Keine Daten zu Maßnahmen"
        );
    }
}

var mouseover = function (d) {
    tooltipRequired = true;
    selection = d3.select(this);
    htmlTooltip
        .style("opacity", 1);
    d3.select(this)
        .style("stroke", "#6ad3ff")
        .style("opacity", 1)
};

var mousemove = function (d) {
    selection = d3.select(this);
    updateTooltipInfo();

    htmlTooltip
        .html(buildTooltipText())
        .style("left", document.getElementById("dataWrapper").getBoundingClientRect().x + (d3.mouse(this)[0]) + 20 + "px")
        .style("top", document.getElementById("dataWrapper").getBoundingClientRect().y + (d3.mouse(this)[1]) - 80 + "px")

};

var mouseleave = function (d) {
    htmlTooltip
        .style("opacity", 0);
    d3.select(this)
        .style("stroke", "black")
};

const valueMap = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
