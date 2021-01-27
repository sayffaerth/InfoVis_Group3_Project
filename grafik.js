/**
 * SVG elements that shall contain the visualisations
 */
var svg = d3.select("#visGer"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var mapParentSVG = d3.select("#mapParentSVG");

/**
 * Variable with Getter and Setter that notify an dateUpdated() function when changed, so the map can be adjusted
 * It contains two separate variables in order to accomodate different formatting requirements.
 * @type {{val, value2: string, val2, value: string}}
 */
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

// %%%%%%%%%%%%%%%%%%%%%
// % Setup color scale %
// %%%%%%%%%%%%%%%%%%%%%

/**
 * The Color Scale is scaled exponentially to account for the exponential nature of virus spreads with the following factor
 * @type {number}
 */
const scaleFactor = 1.2

/**
 * Domain of the color scale with a length of colors to interpolate between.
 * @type {any[]}
 */
var scaleDomain = new Array(12);
//Scale should start at 0 (not scaleFactor^0 = 1)
scaleDomain[0] = 0;

//Distribute the colors across the domain according to the exponential scaleFactor above.
for (i = 1; i < scaleDomain.length; i++) {
    scaleDomain[i] = (Math.pow(scaleFactor, i)) / (Math.pow(scaleFactor, scaleDomain.length));
    //console.log(scaleDomain[i] + " = (" + scaleFactor + " ^ " + i + " ) / ( " + scaleFactor + " ^ " + scaleDomain.length + " )");
}

/**
 * Distributing Colors across the exponential scale stops from white to light yellow to dark purple, modified in equal steps according to hue and later on also luminance.
 * The colors have been carefully chosen with a RGB scale in order to accomodate for all types of color blindness.
 */
var inzColorScale = d3.scaleLinear()
    .domain(scaleDomain)
    .range(["#ffffff", "#ffff4d", "#ffd24d", "#ffc34d", "#ffa64d", "#ff794d", "#ff4d4d", "#ff1a1a", "#e60039", "#b30059", "#800060", "#4d004d"]);

/**
 * Inzidenz Value where the scale and map color changes cap out
 * @type {number}
 */
const inzidenzMax = 400;

/**
 * How many stops on the scale between which the color is interpolated
 * @type {number}
 */
const legendAccuracy = 50;


// %%%%%%%%%%%%%%%%%%%%
// % Map & projection %
// %%%%%%%%%%%%%%%%%%%%

//We utilize d3.js geoPath for our map together with data provided by the RKI
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(2400)        // This is like the zoom
    .center([11, 51.2])  // GPS of location to zoom on
    .translate([width / 2, height / 2]);

/**
 * Variable that holds the case data as an array from a loaded JSON-String.
 */
var caseData;

/**
 * Fetch JSON / CSV Data from servers or load from included files
 * Afterwards save it in corrseponding variables or provide it to handling functions as soon as loading = complete
 * For additional details about the datasets used please refer to the Github Project Wiki - Datensätze (german)
 */
var data = d3.map();
d3.queue()
    .defer(d3.json, "https://opendata.arcgis.com/datasets/ef4b445a53c1406892257fe63129a8ea_0.geojson")
    .defer(d3.json, "./Data/rki2020data-parsed.json")
    .defer(d3.csv, "./Data/ZPID lockdown measures dataset 4.0.csv")
    .await(function (error, topo, cases, rules) {
        if (error) {
            console.log('Error when loading .json or .csv files in grafik.js');
        } else {
            caseData = cases;
            dataLoaded(topo);
            InitializeRulesAndMeasures(rules);
        }
    });

/**
 * This is called as soon as map data is successfully fetched from RKI
 * It draws the map and attaches the listeners required for the mouse tooltip
 * @param topo topographical data that was loaded and shall be used to draw the map and attached to it
 */
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

/**
 * Assigns the states within the map their name as a class - drawn from the RKI map data
 */
function assignIDs() {
    d3.select(".map").selectAll("path").each(function () {
        var u = d3.select(this);
        u.classed(u.data()[0].properties.LAN_ew_GEN, true);
    })
}

/**
 * Updates the fill color of all states for their respective "Inzidenz"-value and the currently selected date
 * This is called whenever changes are applied either when first loading or a new date is selected
 */
function updateMapFillData() {
    /*
    // Previous approach: This uses the fetched date from RKI for the date of when the site is loaded.
    // This is no longer required, as we focus on 2020 as a whole. But it is left in for possible future expansion.
    //
    d3.select(".map").selectAll("path").attr("fill", (function () {
        var inzidenz = d3.select(this).data()[0].properties.cases7_bl_per_100k;
        return inzColorScale(valueMap(inzidenz, 0, 200, 0, 1));
    }));
    // End - previous approach //
    */

    /*
    // New apporach: Contrary to the above this now uses the parsed JSON for 2020 as a whole and no longer requires daily RKI data.
    //*/
    // Fetch the index of the array where the current date is located. This is done for performance's sake so less overall iterations are required.
    var dataIndexForDate = 0;
    for (i = 0; i < caseData.length; i++) {
        if (caseData[i].Meldedatum === currentDate.val) {
            dataIndexForDate = i;
            //console.log("Index for date is "+i);
            break;
        }
    }

    //for all of the states within the map...
    d3.select(".map").selectAll("path").attr("fill", (function () {
        //...get their name and the current date...
        var state2update = d3.select(this).data()[0].properties.LAN_ew_GEN;
        var date2update = currentDate.val;
        //console.log("Please update "+state2update+" to "+date2update);

        //...then fetch the data index for that specific state...
        //(same performance reason as above with the date index)
        var dataIndexForState = 0;
        for (i = 0; i < caseData[dataIndexForDate].casesByBL.length; i++) {
            if (caseData[dataIndexForDate].casesByBL[i].Bundesland === state2update) {
                dataIndexForState = i;
                //console.log("Index for state is "+i);
                break;
            }
        }

        //... and finally fetch the "Inzidenz" value for those two indices, ...
        var inzidenz = caseData[dataIndexForDate].casesByBL[dataIndexForState].cases.Inzidenz;
        //console.log("Inzidenz for "+state2update+" on "+currentDate.val+" is "+inzidenz);

        //... which is then being used to update the fill to the corresponding color from our color scale (that we setup in the beginning).
        return inzColorScale(valueMap(inzidenz, 0, inzidenzMax, 0, 1));
    }));
}

// %%%%%%%%%%%%%%%%%%%%
// % Map color legend %
// %%%%%%%%%%%%%%%%%%%%
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

for (i = 0; i <= legendAccuracy; i++) {
    legend.append("stop")
        .attr("offset", ((100 / legendAccuracy) * i) + "%")
        .attr("stop-color", inzColorScale((1 / legendAccuracy) * i))
        .attr("stop-opacity", 1);
}

legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

var yRange = d3.scaleLinear()
    .domain([0, inzidenzMax])
    .range([legendHeight, 0]);

var legendAxis = d3.axisRight(yRange)
    .tickValues(d3.range(0, inzidenzMax + 1, 25));


legendSvg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", "translate(" + legendWidth + ", 0)")
    .call(legendAxis);

mapParentSVG.append("text")
    .attr("x", 4)
    .attr("y", -5)
    .attr("dy", legendFullHeight)
    .style("fill", "whiteSmoke")
    .style("font-size", "10px")
    .text("Inzidenzwert")
    .attr("font-family", "calibri");

// %%%%%%%%%%%%%%%%%%%%
// % Tooltip          %
// %%%%%%%%%%%%%%%%%%%%

// HTML Version of the Tooltip
var htmlTooltip =
    d3.select("#mapSVG")
        .append("div")
        .style("opacity", 0)
        .attr("class", "MapTooltip")
        .style("text-align", "left")
        .style("z-index", "100")
        //todo make tooltip unselectable
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

/**
 * helper variable to check if the day of the date actually changed.
 */
var tempDate;

/**
 * Gets called whenever the var currentDate.val gets changed
 */
function dateUpdated() {
    if (currentDate.val === tempDate) {
        //The day of the date hasn't actually changed so we can return now.
        return;
    }
    tempDate = currentDate.val;

    //---------- Insert functionality below ----------//
    updateMapFillData();

    //loads rules & measures dataset into the states on the map
    d3.select(".map").selectAll("path").each(function () {
        loadCovidRulesIntoMap(CovidRulesAndMeasures, d3.select(this));
    })
    if (tooltipRequired)
        updateTooltipInfo();

    //Create the contents of the tooltip
    d3.select(".MapTooltip")
        .html(buildTooltipText());
}

/**
 * Returns the Incidence for the current date for the provided state (BL) name.
 * @param stateName state for which you want to get the "Inzidenz" value
 * @returns {*} the corresponding value
 */
function getInzidenzForBL(stateName) {
    var date2update = currentDate.val;

    var dataIndexForDate = 0;
    for (i = 0; i < caseData.length; i++) {
        if (caseData[i].Meldedatum === currentDate.val) {
            dataIndexForDate = i;
            //console.log("Index for date is "+i);
            break;
        }
    }

    var dataIndexForState = 0;
    for (i = 0; i < caseData[dataIndexForDate].casesByBL.length; i++) {
        if (caseData[dataIndexForDate].casesByBL[i].Bundesland === stateName) {
            dataIndexForState = i;
            //console.log("Index for state is "+i);
            break;
        }
    }
    var inzidenz = caseData[dataIndexForDate].casesByBL[dataIndexForState].cases.Inzidenz;
    //console.log("Inzidenz for "+stateName+" on "+currentDate.val+" is "+inzidenz);
    return inzidenz;
}

/**
 * contains the dataset with all the rules and measures
 */
var CovidRulesAndMeasures;

/**
 * Gets called when the dataset is first loaded
 * @param d Dataset with the rules & measures
 */
function InitializeRulesAndMeasures(d) {
    CovidRulesAndMeasures = d;
    d3.select(".map").selectAll("path").each(function () {
        loadCovidRulesIntoMap(CovidRulesAndMeasures, d3.select(this));
    })
}

/**
 * Loads the corresponding rules and measures data into a state on the map via attribute
 * @param d Dataset
 * @param selection the state
 */
function loadCovidRulesIntoMap(d, selection) {
    let tmpLand;
    let date = currentDate.val2;
    // on that day and before there were no measures, but dataset starts there
    if (date < "2020-03-08") {
        date = "2020-03-08";
    }
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
/**
 *
 */
var selection;
var land;
var cases;

/**
 * All rules and measures
 * Data gets loaded into here from state which is currently relevant for the tooltip
 */
var rulesAndMeasures = {
    leavehome: "",  // permission to leave home without reason
    dist: "",       //
    msk: "",        //
    shppng: "",     //
    hcut: "",       //
    ess_shps: "",   //
    zoo: "",        //
    demo: "",       //
    school: "",     //
    church: "",     //
    onefriend: "",  //
    morefriends: "",//
    plygrnd: "",    //
    daycare: "",    //
    trvl: "",       //
    gastr: ""       //
}

/**
 * Helper function to be able to iterate through objects
 * @param o Object to iterate through
 * @returns {IterableIterator<*[]>} iterable key, value pair
 */
function* iterate_object(o) {
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
        yield [keys[i], o[keys[i]]];
    }
}

/**
 * Update the data for the selected state
 */
function updateTooltipInfo() {
    land = selection.data()[0].properties.LAN_ew_GEN;
    cases = Math.round(getInzidenzForBL(land));

    for (let [key, value] of iterate_object(rulesAndMeasures)) {
        rulesAndMeasures[key] = selection.attr("" + key);
    }
}

/**
 * Creates the content of the rules & measures tooltip
 * Includes state name, date, incidence and icons symbolizing the different measures
 * @returns {string} html data which should be shown in the tooltip
 */
function buildTooltipText() {
    let string;

    /** this is only so the all tooltip boxes are of the same width and look neat
     if (land === "Mecklenburg-Vorpommern") {
        string = "Mecklenburg-<br>Vorpommern" + " <br> am " + currentDate.val + "<br> Inzidenz: " + cases + "<br>";
    } else if (land === "Nordrhein-Westfalen") {
        string = "Nordrhein-<br>Westfalen" + " <br> am " + currentDate.val + "<br> Inzidenz: " + cases + "<br>";
    } else if (land === "Baden-Württemberg") {
        string = "Baden-<br>Württemberg" + " <br> am " + currentDate.val + "<br> Inzidenz: " + cases + "<br>";
    } else { */
    string = land + " <br> am " + currentDate.val + "<br> Inzidenz: " + cases + "<br>";
    //}

    if (!!rulesAndMeasures.msk) {
        for (let [key, value] of iterate_object(rulesAndMeasures)) {
            switch (key) {
                case "leavehome":
                    if (rulesAndMeasures.leavehome === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/zuhause.png\" alt="Zuhause bleiben" width="30" height="30">');
                    } else if (rulesAndMeasures.leavehome === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/zuhause.png\" alt="Zuhause bleiben" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/zuhause.png\" alt="Zuhause bleiben" width="30" height="30">');
                    }
                    break;
                case "dist":
                    if (rulesAndMeasures.dist === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/abstand.png\" alt="Abstandsregelung" width="30" height="30">');
                    } else if (rulesAndMeasures.dist === "2") {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/abstand.png\" alt="Abstandsregelung" width="30" height="30">');
                    }
                    break;
                case "msk":
                    if (rulesAndMeasures.msk === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/maske.png\" alt="Maskenpflicht" width="30" height="30">');
                    } else if (rulesAndMeasures.msk === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/maske.png\" alt="Maskenpflicht" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/maske.png\" alt="Maskenpflicht" width="30" height="30">');
                    }
                    break;
                case "shppng":
                    if (rulesAndMeasures.shppng === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/einkaufen.png\" alt="Einkaufseinschränkung" width="30" height="30">');
                    } else if (rulesAndMeasures.shppng === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/einkaufen.png\" alt="Einkaufseinschränkung" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/einkaufen.png\" alt="Einkaufseinschränkung" width="30" height="30">');
                    }
                    string += '<br>';
                    break;
                case "hcut":
                    if (rulesAndMeasures.hcut === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/frisur.png\" alt="Friseure" width="30" height="30">');
                    } else if (rulesAndMeasures.hcut === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/frisur.png\" alt="Friseure" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/frisur.png\" alt="Friseure" width="30" height="30">');
                    }
                    break;
                case "ess_shps":
                    if (rulesAndMeasures.ess_shps === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/essentiel.png\" alt="Essentielle Shops" width="30" height="30">');
                    } else if (rulesAndMeasures.ess_shps === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/essentiel.png\" alt="Essentielle Shops" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/essentiel.png\" alt="Essentielle Shops" width="30" height="30">');
                    }
                    break;
                case "zoo":
                    if (rulesAndMeasures.zoo === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/zoo.png\" alt="Zoos geschlossen" width="30" height="30">');
                    } else if (rulesAndMeasures.zoo === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/zoo.png\" alt="Zoos geschlossen" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/zoo.png\" alt="Zoos geschlossen" width="30" height="30">');
                    }
                    break;

                case "demo":
                    if (rulesAndMeasures.demo === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/demo.png\" alt="Demoverbot" width="30" height="30">');
                    } else if (rulesAndMeasures.demo === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/demo.png\" alt="Demoverbot" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/demo.png\" alt="Demoverbot" width="30" height="30">');
                    }
                    string += '<br>';
                    break;
                case "school":
                    if (rulesAndMeasures.school === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/schule.png\" alt="Maskenpflicht" width="30" height="30">');
                    } else if (rulesAndMeasures.school === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/schule.png\" alt="Maskenpflicht" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/schule.png\" alt="Maskenpflicht" width="30" height="30">');
                    }
                    break;
                case "church":
                    if (rulesAndMeasures.church === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/kirche.png\" alt="Kirchen geschlossen" width="30" height="30">');
                    } else if (rulesAndMeasures.church === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/kirche.png\" alt="Kirchen geschlossen" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/kirche.png\" alt="Kirchen geschlossen" width="30" height="30">');
                    }
                    break;
                case "onefriend":
                    if (rulesAndMeasures.onefriend === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/kontaktv.png\" alt="Kontaktverbot" width="30" height="30">');
                    } else string += ('<img src="./Pictures/Maßnahmen/Rot/kontaktv.png\" alt="Kontaktverbot" width="30" height="30">');
                    break;
                case "morefriends":
                    if (rulesAndMeasures.morefriends === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/kontaktb.png\" alt="Kontaktbeschränkung" width="30" height="30">');
                    } else if (rulesAndMeasures.morefriends === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/kontaktb.png\" alt="Kontaktbeschränkung" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/kontaktb.png\" alt="Kontaktbeschränkung" width="30" height="30">');
                    }
                    string += '<br>';
                    break;
                case "plygrnd":
                    if (rulesAndMeasures.plygrnd === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/maske.png\" alt="Kindergärten zu" width="30" height="30">');
                    } else if (rulesAndMeasures.plygrnd === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/spiel.png\" alt="Kindergärten zu" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/spiel.png\" alt="Kindergärten zu" width="30" height="30">');
                    }
                    break;
                case "daycare":
                    if (rulesAndMeasures.daycare === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/kinder.png\" alt="Kindergärten zu" width="30" height="30">');
                    } else if (rulesAndMeasures.daycare === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/kinder.png\" alt="Kindergärten zu" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/kinder.png\" alt="Kindergärten zu" width="30" height="30">');
                    }
                    break;
                case "trvl":
                    if (rulesAndMeasures.daycare === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/reise.png\" alt="Reisebeschränkungen" width="30" height="30">');
                    } else if (rulesAndMeasures.daycare === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/reise.png\" alt="Reisebeschränkungen" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/reise.png\" alt="Reisebeschränkungen" width="30" height="30">');
                    }
                    break;
                case "gastr":
                    if (rulesAndMeasures.daycare === "0") {
                        string += ('<img src="./Pictures/Maßnahmen/gastro.png\" alt="Gastronomie geschlossen" width="30" height="30">');
                    } else if (rulesAndMeasures.daycare === "1") {
                        string += ('<img src="./Pictures/Maßnahmen/Orange/gastro.png\" alt="Gastronomie geschlossen" width="30" height="30">');
                    } else {
                        string += ('<img src="./Pictures/Maßnahmen/Rot/gastro.png\" alt="Gastronomie geschlossen" width="30" height="30">');
                    }
                    break;
                default:
                    break;
            }
        }
    } else {
        string += "Keine Daten";
    }
    return string;
}

/**
 * Shows the rules & measures tooltip by changing transparency
 */
var mouseover = function () {
    tooltipRequired = true;
    selection = d3.select(this);
    updateTooltipInfo();
    htmlTooltip
        .style("opacity", 1);
    d3.select(this)
        .style("stroke", "#6ad3ff")
        .style("opacity", 1)
};

/**
 * Moves the rules & measures tooltip with the mouse
 */
var mousemove = function (d) {
    selection = d3.select(this);

    htmlTooltip
        .html(buildTooltipText())
        .style("left", d3.event.pageX - document.getElementById("mapSVG").getBoundingClientRect().x + 30 + "px")
        .style("top", d3.event.pageY - document.getElementById("mapSVG").getBoundingClientRect().y + 30 + "px")

};

/**
 * Hides the rules & measures tooltip by making it transparent
 */
var mouseleave = function () {
    htmlTooltip
        .style("opacity", 0);
    d3.select(this)
        .style("stroke", "black")
};

const valueMap = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
