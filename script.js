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

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 190 - margin.top - margin.bottom;

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
        .call(d3.axisBottom(xAxis))
        .on('mouseover', function(event){
            var target = event.target || event.srcElement;
            console.log(target.innerHTML);
            var caseNumber = target.innerHTML;
            showKW(caseNumber - 1);
        } );

    var yAxis =d3.scaleLinear()
        .domain([(d3.min(data, item => Number(item.cases)))-1, d3.max(data, item => Number(item.cases))])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisLeft(yAxis))

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(item => xAxis(item.day))
            .y(item => yAxis(Number(item.cases)))
        );
}