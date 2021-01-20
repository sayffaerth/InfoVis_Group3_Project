
var tooltip1 = d3.select("#infoDiv1")
    .append("div")
        .attr("id", "div1")
        .style("visibility", "hidden")
        .style("width", "200px")
        .style("height", "250px")
        .style("margin-top", "-250px")
        .style("z-index", "10")
        .style("background", "#fff")
        .style("transform", "translate(310px, 250px")
        .html("<p style='color:red; padding-top: 5px; padding-left: 5px'><b>Deutschlandkarte</b></p>" +
            "<p style='padding-left: 5px'>Einfärbung entsprechend des Inzidenzwertes stärker oder schwächer</p>" +
            "<p style='padding-left: 5px'>Tooltip pro Bundesland angepasst an die Fallzahlen</p>" +
            "<p style='padding-left: 5px'><b>Inhalt:</b><br/>- Datum<br/>- Inzidenzwert<br/>- geltende Maßnahmen")
        .style("color", "black")
        .style("text-align", "left");

d3.select("#infobox1")
    .on("mouseover", function(){return tooltip1.style("visibility", "visible");})
    .on("mouseout", function(){return tooltip1.style("visibility", "hidden");});

var tooltip2 = d3.select("#infoDiv2")
    .append("div")
        .attr("id", "div2")
        .style("visibility", "hidden")
        .style("width", "200px")
        .style("height", "220px")
        .style("z-index", "10")
        .style("margin-top", "-220px")
        .style("background", "#fff")
        .style("transform", "translate(1050px, 200px")
        .html("<p style='color:red; padding-top: 5px; padding-left: 5px'><b>Verkaufsrace</b></p>" +
        "<p style='padding-left: 5px'>Absatzindex ausgewählter Produkte pro Kalenderwoche deutschlandweit</p>" +
        "<p style='padding-left: 5px'><b>Produkte:</b><br/>- Seife<br/>- Tiolettenpapier<br/>- Mehl<br/>- Desinfektionsmittel<br/>- Hefe")
        .style("color", "black")
        .style("text-align", "left");

d3.select("#infobox2")
    .on("mouseover", function(){return tooltip2.style("visibility", "visible");})
    .on("mouseout", function(){return tooltip2.style("visibility", "hidden");});

var tooltip3 = d3.select("#infoDiv3")
    .append("div")
        .attr("id", "div3")
        .style("visibility", "hidden")
        .style("width", "200px")
        .style("height", "250px")
        .style("margin-top", "-250px")
        .style("background", "#fff")
        .style("z-index", "10")
        .style("transform", "translate(335px,225px")
        .html("<p style='color:red; padding-top: 5px; padding-left: 5px'><b>Fallzahlen Deutschland</b></p>" +
        "<p style='padding-left: 5px'>Anzahl der Infektionen pro Tag duetschlandweit</p>" +
        "<p style='padding-left: 5px'><b>Play-Button:</b> Spielt gesamte Animation ab und visualisiert den Infektionsverlauf 2020</p>"+
        "<p style='padding-left: 5px'>Es besteht die Möglichkeit die Animation zu pausieren und zu einem beliebeigen Tag per <i>'Klick'</i> zu springen")
        .style("color", "black")
        .style("text-align", "left");

d3.select("#infobox3")
    .on("mouseover", function(){return tooltip3.style("visibility", "visible");})
    .on("mouseout", function(){return tooltip3.style("visibility", "hidden");});