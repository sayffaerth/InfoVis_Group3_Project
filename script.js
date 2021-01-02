var month;
var week;

// Get Data Fallzahlen
function traverseData(data){
    const fallzahlen = data.filter(item => item.year == 2020);

    visualizeAsLineChart(fallzahlen);
}

//Get Data Kaufverhalten
function salesData(data){
    const racezahlen = data.filter(item => item);
    visualizeRace(racezahlen);
};

// Visualisiere Fallzahlen Funktion
function visualizeAsLineChart(data) {
  var margin = { top: 10, right: 120, bottom: 20, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 170 - margin.top - margin.bottom,
        tooltip = { width: 100, height: 100, x: 10, y: -30 };

    var parseDate = d3.timeParse("%d/%m/%Y"),
        bisectDate = d3.bisector(function(d) { return d.dateRep; }).left,
        formatValue = d3.format(","),
        dateFormatter = d3.timeFormat("%b %y"); // Monthname Jahreszahl
        dateFormatter2 = d3.timeFormat("%d/%m/%Y"); //Tag/Monat/Jahr
        dateFormatter3 = d3.timeFormat("%m"); //Month
        dateFormatter4 = d3.timeFormat("%W"); //Week

    var x = d3.scaleTime()
            .range([0, width]);

    var y = d3.scaleLinear()
            .range([height, 0]);

    var xAxis = d3.axisBottom(x)
        .tickFormat(dateFormatter);

    var yAxis = d3.axisLeft(y)
        .tickFormat(d3.format(""));

    //Zeichnet Funktion
    var line = d3.line()
        .x(function(d) { return x(d.dateRep); })
        .y(function(d) { return y(d.cases); });

    //Zeichnet Fläche
    var svg = d3.select("#visFall")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        //Convertiert die Daten
        data.forEach(function(d) {
            d.dateRep = parseDate(d.dateRep);
            d.cases = +d.cases;
        });

        //Sortiert das Datum
        data.sort(function(a, b) {
            return a.dateRep - b.dateRep;
        });

        //Legt Achsenbeschriftung fest
        x.domain([data[0].dateRep, parseDate("01/12/2020")]);
        //x.domain([data[0].dateRep, data[data.length-1].dateRep]);
        y.domain([0, 24000]);
        //y.domain(d3.extent(data, function(d) { return d.cases; }));

        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Fallzahlen");

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#9de0ff")
            .attr("class", "line")
            .attr("d", line);

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
          .attr("class", "x")
          .style("stroke", "white")
          .style("opacity", 0.5)
          .style("stroke-width", "2px")
          .attr("y1", -250)
          .attr("y2", 250);

        focus.append("circle")
          .attr("class", "y")
          .style("fill", "none")
          .style("stroke", "white")
          .attr("r", 4);

        focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 106)
            .attr("height", 40)
            .attr("x", 10)
            .attr("y", -15)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", "grey")
            .style("opacity", 0.7)
            .style("pointer-events", "all");

        focus.append("text")
            .attr("class", "tooltip-date")
            .attr("font-family", "calibri")
            .attr("font-size","14px")
            .attr("x", 18)
            .attr("y", 0)
            .style("fill", "white");

        focus.append("text")
            .attr("x", 18)
            .attr("y", 18)
            .attr("font-family", "calibri")
            .attr("font-size","14px")
            .text("Fallzahl:")
            .style("fill", "white");

        focus.append("text")
            .attr("class", "tooltip-cases")
            .attr("font-family", "calibri")
            .attr("font-size","14px")
            .attr("x", 70)
            .attr("y", 18)
            .style("fill", "white");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.dateRep > d1.dateRep - x0 ? d1 : d0;
            focus.attr("transform", "translate(" + x(d.dateRep) + "," + y(d.cases) + ")");
            focus.select(".tooltip-date").text(dateFormatter2(d.dateRep));
            focus.select(".tooltip-cases").text(formatValue(d.cases));
            
            //Variable für den Monat und die Woche
            month = dateFormatter3(d.dateRep);
            week = dateFormatter4(d.dateRep);
            //console.log(month);
            //console.log(week);
        }

    }
 
//----------------------------------------------------------------------------------

//Visualisiere das Race
function visualizeRace(data){
    
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#visRace")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Formatierungen für die Zeit
    var parseDate = d3.timeParse("%W. KW %Y"),
        bisectDate = d3.bisector(function(d) { return d.Kalenderwoche; }).left,
        formatValue = d3.format(","),
        dateFormatter = d3.timeFormat("%Y");
        dateFormatter2 = d3.timeFormat("%m");

    //Formatiert Kalenderwochen in den Daten
    data.forEach(function(d) {
        d.Kalenderwoche = parseDate(d.Kalenderwoche);
    });

    //Größe Achsen
    var x = d3.scaleBand()
            .range([0, width]).padding(0.7);

    var y = d3.scaleLinear()
            .range([height, 0]);

    //Position Achse
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    //Sortieren
    data.sort(function(a, b) {
        return a.Kalenderwoche - b.Kalenderwoche;
    });

    //Achsenbeschriftung
    x.domain(Object.keys(dataToDraw(data)));
    y.domain([0, 900]);

    //X-Achse
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //Y-Achse
    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Absatzindex");

    //Entfernt die Kalenderwochen von den Daten
    function dataToDraw(data){
            let returnData = {
                Seife : parseFloat(data.Seife),
                Toilettenpapier : parseFloat(data.Toilettenpapier), 
                Mehl : parseFloat(data.Mehl),
                Desinfektionsmittel : parseFloat(data.Desinfektionsmittel),
                Hefe : parseFloat(data.Hefe)
            }
            return returnData
    }

    console.log(data.Seife);
    // for (let i of data) {
    // if (dateFormatter2(d.Kalenderwoche) == week){
    // timeChoose(data[i]);}}
    timeChoose(data[0]);

    function timeChoose(data){

    /** 
    var newData = {
        "Seife" : parseFloat(data.Seife),
        "Toilettenpapier" : parseFloat(data.Toilettenpapier), 
        "Mehl" : parseFloat(data.Mehl),
        "Desinfektionsmittel" : parseFloat(data.Desinfektionsmittel),
        "Hefe" : parseFloat(data.Hefe)
    } */

    
    var newData = [
        {"Product": "Seife", "Count": parseFloat(data.Seife)},
        {"Product": "Toilettenpapier", Count: parseFloat(data.Toilettenpapier)},
        {"Product": "Mehl", "Count": parseFloat(data.Mehl)},
        {"Product": "Desinfektionsmittel", Count: parseFloat(data.Desinfektionsmittel)},
        {"Product": "Hefe", "Count": parseFloat(data.Hefe)}
    ]
    
    console.log(week);
    console.log(Object.values(newData));

    svg.selectAll(".bar")
        .data(newData)
        .enter()
        .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.Product); })
            .attr("y", function(d) { return y(d.Count); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Count); })
            .attr("fill", "#9de0ff");
    }
}