var fallTime;

// Get Data Fallzahlen
function traverseData(data){
    const fallzahlen = data.filter(item => item.year == 2020);

    visualizeAsLineChart(fallzahlen);
}

/**Get Data Kaufverhalten
function salesData(data){
    const racezahlen = data.filter(item => item);
    visualizeRace(racezahlen);
}; */

// Visualisiere Fallzahlen Funktion
function visualizeAsLineChart(data) {
  var margin = { top: 10, right: 120, bottom: 20, left: 50 },
        width = 700 - margin.left - margin.right,
        height = 170 - margin.top - margin.bottom,
        tooltip = { width: 100, height: 100, x: 10, y: -30 };

    var parseDate = d3.timeParse("%d/%m/%Y"),
        bisectDate = d3.bisector(function(d) { return d.dateRep; }).left,
        formatValue = d3.format(","),
        dateFormatter = d3.timeFormat("%b %y");
        dateFormatter2 = d3.timeFormat("%d/%m/%Y");

    var x = d3.scaleTime()
            .range([0, width]);

    var y = d3.scaleLinear()
            .range([height, 0]);

    var xAxis = d3.axisBottom(x)
        .tickFormat(dateFormatter);

    var yAxis = d3.axisLeft(y)
        .tickFormat(d3.format(""));

    var line = d3.line()
        .x(function(d) { return x(d.dateRep); })
        .y(function(d) { return y(d.cases); });


    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(function(d) {
            d.dateRep = parseDate(d.dateRep);
            d.cases = +d.cases;
        });

        data.sort(function(a, b) {
            return a.dateRep - b.dateRep;
        });

        x.domain([data[0].dateRep, data[data.length-1].dateRep]);
        y.domain(d3.extent(data, function(d) { return d.cases; }));

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
            .attr("width", 100)
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
            fallTime = dateFormatter(d.dateRep);
            var month = fallTime.split("/")[1];
            if(month.charAt(0) == 0) {
                month = month.substring(1);
                console.log(month);
                showKW(month);
            } else {
                showKW(month);
            }
            console.log(month);
        }

    }
 

//Visualisiere das Race
/**function visualizeRace(data){
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

    var svg = d3.select("#visConRace")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var xAxis = d3.scaleLinear()
        .domain(d3.min(data.Kalenderwoche), d3.max(data.Kalenderwoche))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis));

    var yAxis =d3.scaleLinear()
        .domain([0, d3.max(data.Desinfektionsmittel)])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisRight(yAxis)); 
    

    const anchors = svg
        .selectAll('.anchor')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'anchor')
        .attr('fill', 'white')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1)
        .attr('r', 2)
        .attr('cx', ({jahr}) => xAxis(jahr))
        .attr('cy', ({wert}) => yAxis(wert))
}
*/