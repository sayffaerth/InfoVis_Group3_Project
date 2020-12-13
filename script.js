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
    var svg = d3.select("body").append("svg")
      .attr("width", 700)
      .attr("height", 190)

    var margin = {left:30, right:30, top: 10, bottom: 30}
    var width = svg.attr("width") - margin.left - margin.right;
    var height = svg.attr("height") - margin.bottom - margin.top;

    var x = d3.scaleTime()
    	.rangeRound([0, width]);
    var x_axis = d3.axisBottom(x);
    
    var y = d3.scaleLinear()
    	.rangeRound([height, 0]);
    var y_axis = d3.axisBottom(y);
    var xFormat = "%b";
    var parseTime = d3.timeParse("%d/%m/%Y");
    
    x.domain(d3.extent(data, function(d) { return parseTime(d.dateRep); }));
  	y.domain([0, d3.max(data, function(d) { return d3.max([d.cases/1000]);
              })]);

    var a = function(d) {return d.cases};
    
    var multiline = function(category) {
      var line = d3.line()
                  .x(function(d) { return x(parseTime(d.dateRep)); })
                  .y(function(d) { return y(d.cases/1000); });
      return line;
    }
    
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    var g = svg.append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    
      g.append("path")
        .datum(data) 
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", multiline(data.cases));
    
      // Add the X Axis
  		g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat(xFormat)));
    
      // Add the Y Axis
  		g.append("g")
      .call(d3.axisLeft(y));
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