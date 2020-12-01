// Get Data Fallzahlen
function traverseData(data){
    const fallzahlen = data.filter(item => item.year == 2020);

    visualizeAsLineChart(fallzahlen);
}

//Get Data Kaufverhalten
d3.csv("./Data/20200520-vpi-absatz-verbrauchsgueter-kw-20-2020.csv", function(data){
    const racezahlen = data.filter(item => item);
    visualizeRace(racezahlen);
});


// Visualisiere Fallzahlen Funktion
function visualizeAsLineChart(data) {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    var svg = d3.select("#visualizationContainer")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var xAxis = d3.scaleLinear()
        .domain(d3.extent(data, item => item.month))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis));

    var yAxis =d3.scaleLinear()
        .domain([(d3.min(data, item => Number(item.cases)))-1, d3.max(data, item => Number(item.cases))])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisLeft(yAxis)); 

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(item => xAxis(item.day))
            .y(item => yAxis(Number(item.cases)))
        );
 
//Visualisiere das Race
function visualizeRace(data){
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

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
    }

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